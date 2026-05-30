/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

// CSP calibrée pour FORJA :
// - 'unsafe-inline' (style + script) car l'UI repose sur des styles inline et
//   Next injecte des scripts d'hydratation inline (pas de nonce en place).
// - 'unsafe-eval' uniquement en dev (HMR / React Refresh).
// - images en data:/blob: (génération d'images + téléchargement PDF).
// - connect-src : même origine + Sentry + PostHog EU + Microsoft Clarity.
//   (PostHog & Clarity sont chargés UNIQUEMENT après consentement utilisateur ;
//    cf. src/components/Analytics.tsx + ConsentBanner.tsx.)
// - script-src : autorise les SDK analytics tiers (chargés conditionnellement).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://eu.i.posthog.com https://eu-assets.i.posthog.com https://www.clarity.ms https://*.clarity.ms`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.sentry.io https://*.ingest.sentry.io https://eu.i.posthog.com https://eu-assets.i.posthog.com https://www.clarity.ms https://*.clarity.ms${isDev ? " ws:" : ""}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  serverExternalPackages: ["puppeteer", "@sparticuz/chromium"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
