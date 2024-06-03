import * as ai from "applicationinsights";

import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { metrics, trace } from "@opentelemetry/api";
import { IJsonConfig } from "applicationinsights/out/src/shim/types";

process.env.APPLICATIONINSIGHTS_INSTRUMENTATION_LOGGING_LEVEL = "NONE";
process.env.APPLICATIONINSIGHTS_LOG_DESTINATION = "file+console";

if (process.env["AI_SDK_CONNECTION_STRING"]) {
  console.log("using opetelemetry");

  // setup sampling percentage from environment, see
  // https://github.com/microsoft/ApplicationInsights-node.js?tab=readme-ov-file#configuration
  // for other options. environment variable is in JSON format and takes
  // precedence over applicationinsights.json
  process.env["APPLICATIONINSIGHTS_CONFIGURATION_CONTENT"] =
    process.env["APPLICATIONINSIGHTS_CONFIGURATION_CONTENT"] ??
    JSON.stringify({
      samplingPercentage: 100,
    } satisfies Partial<IJsonConfig>);

  // setup cloudRoleName
  process.env.OTEL_SERVICE_NAME =
    process.env.WEBSITE_SITE_NAME ?? "local-app-service";

  // instrument native node fetch
  registerInstrumentations({
    tracerProvider: trace.getTracerProvider(),
    meterProvider: metrics.getMeterProvider(),
    instrumentations: [new UndiciInstrumentation()],
  });

  // settings are taken from applicationinsights.json
  ai.setup(process.env["AI_SDK_CONNECTION_STRING"]).start();
}
export default ai;
