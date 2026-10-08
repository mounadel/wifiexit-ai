// Petits textes de l'interface (login, compte, effets) en 3 langues : fr / en / ar.
export function getLang() {
  if (typeof navigator === 'undefined') return 'fr';
  const l = (navigator.language || 'fr').slice(0, 2).toLowerCase();
  return ['fr', 'en', 'ar'].includes(l) ? l : 'fr';
}

const TEXT = {
  fr: {
    welcome: 'Bienvenue', loginTitle: 'Connexion', signupTitle: 'Créer un compte',
    email: 'Email', password: 'Mot de passe', login: 'Se connecter', signup: "S'inscrire",
    noAccount: "Pas de compte ? S'inscrire", haveAccount: 'Déjà un compte ? Se connecter',
    google: 'Continuer avec Google', or: 'ou', confirmEmail: 'Compte créé ! Vérifie ta boîte mail pour confirmer, puis connecte-toi.',
    forgot: 'Mot de passe oublié ?', resetSent: 'Email de réinitialisation envoyé.', enterEmail: "Entre ton email d'abord.",
    account: 'Mon compte', credits: 'crédits', creditsToday: "Crédits d'aujourd'hui", resets: 'Remis à zéro chaque jour à 00:00 UTC.',
    newPassword: 'Nouveau mot de passe', change: 'Changer', passwordChanged: 'Mot de passe modifié.', logout: 'Se déconnecter', close: 'Fermer',
    effects: 'Effets', effectsTitle: 'Effets vidéo', effectsSub: "Choisis un effet, ajoute une photo, et l'IA la met en mouvement.",
    uploadPhoto: 'Ajouter une photo', changePhoto: 'Changer la photo', pickEffect: 'Choisis un effet', generate: 'Générer la vidéo',
    generating: 'Génération en cours… (1 à 3 min)', ratio: 'Format', cost: 'coûte', needPhoto: "Ajoute d'abord une photo.", needEffect: "Choisis d'abord un effet.",
    result: 'Résultat', download: 'Télécharger', mine: 'Mes créations',
  },
  en: {
    welcome: 'Welcome', loginTitle: 'Sign in', signupTitle: 'Create an account',
    email: 'Email', password: 'Password', login: 'Sign in', signup: 'Sign up',
    noAccount: 'No account? Sign up', haveAccount: 'Already have an account? Sign in',
    google: 'Continue with Google', or: 'or', confirmEmail: 'Account created! Check your inbox to confirm, then sign in.',
    forgot: 'Forgot password?', resetSent: 'Reset email sent.', enterEmail: 'Enter your email first.',
    account: 'My account', credits: 'credits', creditsToday: "Today's credits", resets: 'Resets every day at 00:00 UTC.',
    newPassword: 'New password', change: 'Change', passwordChanged: 'Password updated.', logout: 'Sign out', close: 'Close',
    effects: 'Effects', effectsTitle: 'Video effects', effectsSub: 'Pick an effect, add a photo, and AI brings it to life.',
    uploadPhoto: 'Add a photo', changePhoto: 'Change photo', pickEffect: 'Pick an effect', generate: 'Generate video',
    generating: 'Generating… (1–3 min)', ratio: 'Format', cost: 'costs', needPhoto: 'Add a photo first.', needEffect: 'Pick an effect first.',
    result: 'Result', download: 'Download', mine: 'My creations',
  },
  ar: {
    welcome: 'مرحبا', loginTitle: 'تسجيل الدخول', signupTitle: 'إنشاء حساب',
    email: 'البريد الإلكتروني', password: 'كلمة السر', login: 'دخول', signup: 'تسجيل',
    noAccount: 'ماعندكش حساب؟ سجل', haveAccount: 'عندك حساب؟ دخول',
    google: 'المتابعة عبر Google', or: 'أو', confirmEmail: 'تم إنشاء الحساب! شوف الإيميل ديالك باش تأكد، من بعد دخل.',
    forgot: 'نسيتي كلمة السر؟', resetSent: 'تصيفط ليك إيميل إعادة التعيين.', enterEmail: 'كتب الإيميل أولا.',
    account: 'حسابي', credits: 'كريدي', creditsToday: 'كريدي اليوم', resets: 'كيتجدد كل نهار فـ 00:00 UTC.',
    newPassword: 'كلمة سر جديدة', change: 'تبديل', passwordChanged: 'تبدلات كلمة السر.', logout: 'خروج', close: 'سد',
    effects: 'إيفيكتس', effectsTitle: 'إيفيكتس الفيديو', effectsSub: 'اختار إيفيكت، زيد تصويرة، والذكاء الاصطناعي كيحركها.',
    uploadPhoto: 'زيد تصويرة', changePhoto: 'بدل التصويرة', pickEffect: 'اختار إيفيكت', generate: 'صايب الفيديو',
    generating: 'كيتصاوب… (من دقيقة لـ 3)', ratio: 'الشكل', cost: 'كيكلف', needPhoto: 'زيد تصويرة أولا.', needEffect: 'اختار إيفيكت أولا.',
    result: 'النتيجة', download: 'تحميل', mine: 'الإبداعات ديالي',
  },
};

export function t(lang) {
  return (key) => (TEXT[lang] && TEXT[lang][key]) || TEXT.en[key] || key;
}
