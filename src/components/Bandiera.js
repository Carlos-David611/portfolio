// Le bandiere delle lingue, disegnate in SVG: le emoji delle bandiere su Windows non si vedono
const DISEGNI = {
  it: (
    <>
      <path fill="#fff" d="M0 0h30v20H0z" />
      <path fill="#009246" d="M0 0h10v20H0z" />
      <path fill="#ce2b37" d="M20 0h10v20H20z" />
    </>
  ),
  en: (
    <>
      <path fill="#012169" d="M0 0h30v20H0z" />
      <path stroke="#fff" strokeWidth="4" d="m0 0 30 20M30 0 0 20" />
      <path stroke="#c8102e" strokeWidth="1.6" d="m0 0 30 20M30 0 0 20" />
      <path stroke="#fff" strokeWidth="6.6" d="M15 0v20M0 10h30" />
      <path stroke="#c8102e" strokeWidth="4" d="M15 0v20M0 10h30" />
    </>
  ),
  de: (
    <>
      <path fill="#000" d="M0 0h30v7H0z" />
      <path fill="#d00" d="M0 6.67h30v7H0z" />
      <path fill="#ffce00" d="M0 13.33h30V20H0z" />
    </>
  ),
  es: (
    <>
      <path fill="#c60b1e" d="M0 0h30v20H0z" />
      <path fill="#ffc400" d="M0 5h30v10H0z" />
    </>
  ),
};

export default function Bandiera({ codice, className }) {
  return (
    <svg className={className} viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {DISEGNI[codice]}
    </svg>
  );
}
