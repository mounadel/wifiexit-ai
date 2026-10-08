import { NextResponse } from 'next/server';
import { getLocaleFromPathname } from './lib/locales';
import { verifyToken, getUsage, isBlockedV1 } from './lib/gateway';

const SUPABASE_ORIGIN = (() => {
    try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin; } catch { return ''; }
})();

function addSecurityHeaders(response) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    // connect-src inclut Supabase (login) en plus de muapi (médias générés).
    response.headers.set(
        'Content-Security-Policy',
        `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' data: blob: https:; connect-src 'self' https://muapi.ai https://*.muapi.ai ${SUPABASE_ORIGIN} https://*.supabase.co; font-src 'self' data:;`
    );
    return response;
}

function reply(status, error) {
    return addSecurityHeaders(NextResponse.json({ error }, { status }));
}

function getIncomingToken(request) {
    const auth = request.headers.get('authorization');
    if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
    const key = request.headers.get('x-api-key');
    return key ? key.trim() : null;
}

// Toutes les requêtes /api/* passent ici : on vérifie l'utilisateur, on bloque ce qui
// est dangereux, puis on remplace le "token utilisateur" par TA vraie clé muapi
// (elle n'est jamais envoyée au navigateur).
async function handleApi(request) {
    const { pathname } = request.nextUrl;
    const method = request.method;

    if (method === 'OPTIONS') return addSecurityHeaders(NextResponse.next());

    // Fonctions désactivées : elles partageraient les données de ton compte muapi entre tous les utilisateurs.
    if (pathname.startsWith('/api/api/')) return reply(404, 'Not found');
    if (
        pathname.startsWith('/api/workflow') ||
        pathname.startsWith('/api/agents') ||
        pathname.startsWith('/api/v1/creative-agent')
    ) {
        return reply(403, 'This feature is disabled');
    }
    if (pathname.startsWith('/api/app')) {
        const allowed = method === 'GET' && /^\/api\/app\/(get_file_upload_url|get_upload_file)\/?$/.test(pathname);
        if (!allowed) return reply(403, 'This feature is disabled');
    }

    let v1Path = null;
    if (pathname.startsWith('/api/v1/')) {
        v1Path = pathname.slice('/api/v1/'.length);
        if (method !== 'GET' && method !== 'POST') return reply(405, 'Method not allowed');
        if (isBlockedV1(v1Path)) return reply(403, 'Forbidden');
    } else if (!pathname.startsWith('/api/app') && pathname !== '/api/upload-binary') {
        return reply(404, 'Not found');
    }

    if (!process.env.MUAPI_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return reply(500, 'Server is not configured');
    }

    const user = await verifyToken(getIncomingToken(request));
    if (!user) return reply(401, 'Please sign in');

    // Solde = crédits restants de l'utilisateur (et pas ton solde muapi !)
    if (method === 'GET' && v1Path && /^account\/balance\/?$/.test(v1Path)) {
        try {
            const usage = await getUsage(user.id);
            return addSecurityHeaders(NextResponse.json({ ...usage, unit: 'credits' }));
        } catch {
            return reply(503, 'Quota service unavailable');
        }
    }

    const headers = new Headers(request.headers);
    headers.delete('authorization');
    headers.delete('cookie');
    headers.set('x-api-key', process.env.MUAPI_API_KEY);
    headers.set('x-wifiexit-uid', user.id); // écrasé ici : le client ne peut pas le falsifier

    return addSecurityHeaders(NextResponse.next({ request: { headers } }));
}

export async function middleware(request) {
    const url = request.nextUrl;

    if (url.pathname.startsWith('/api/')) {
        return handleApi(request);
    }

    // Pages désactivées (agents / workflows / assistant) → retour au studio
    if (/^(\/zh)?\/(agents|assistant|workflow)(\/|$)/.test(url.pathname)) {
        return addSecurityHeaders(NextResponse.redirect(new URL('/studio', request.url)));
    }

    const response = NextResponse.next();
    response.headers.set('x-locale', getLocaleFromPathname(url.pathname));
    return addSecurityHeaders(response);
}

export const config = {
    matcher: [
        '/api/:path*',
        '/((?!_next/static|_next/image|favicon.ico|__nextjs_original-stack-frame).*)',
    ],
};
