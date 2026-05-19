import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  debug: process.env.NODE_ENV !== "production",
  integrations: [
    Sentry.httpIntegration({
      failedRequestStatusCodes: [
        ...Sentry.defaultIntegrations
          .find((integration) => integration.name === "Http")
          ?.options?.failedRequestStatusCodes ?? [],
        500,
        501,
        502,
        503,
        504,
      ],
    }),
  ],
});
