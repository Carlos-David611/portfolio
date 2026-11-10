/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  images: {
    // AVIF pesa meno di WebP; i browser che non lo conoscono ricevono WebP
    formats: ["image/avif", "image/webp"],
  },
  // per provare il sito dal telefono, collegato allo stesso Wi-Fi: senza questa riga, aprendo
  // l'indirizzo di rete del computer (192.168...) Next.js blocca i suoi file di sviluppo e la
  // pagina non risponde ai tocchi. Vale solo mentre sviluppi, non sul sito pubblicato.
  // "192.168.*.*" = qualsiasi computer della rete di casa, anche se il router cambia il numero
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
