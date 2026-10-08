import { BRAND } from '@/lib/brand';

export default function Logo({ size = 32 }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={BRAND.logo} alt={BRAND.name} width={size} height={size} className="rounded-lg shadow-lg shadow-[#22d3ee]/10" style={{ width: size, height: size }} />
  );
}
