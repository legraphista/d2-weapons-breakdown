import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { CaptureConsole as CaptureConsoleIntegration } from "@sentry/integrations";
import { ExtraErrorData as ExtraErrorDataIntegration } from "@sentry/integrations";

Sentry.init({
  dsn: "https://358881a009ec4ba9a559ccf562bb6b47@o1012438.ingest.sentry.io/5977897",
  integrations: [
    new Integrations.BrowserTracing(),
    new CaptureConsoleIntegration(
      {
        // array of methods that should be captured
        // defaults to ['log', 'info', 'warn', 'error', 'debug', 'assert']
        levels: ['error']
      }
    ),
    new ExtraErrorDataIntegration(
      {
        // limit of how deep the object serializer should go. Anything deeper than limit will
        // be replaced with standard Node.js REPL notation of [Object], [Array], [Function] or
        // a primitive value. Defaults to 3.
        depth: 5
      }
    )
  ],

  tracesSampleRate: 1.0,
});
