import * as ai from "applicationinsights";

import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { metrics, trace } from "@opentelemetry/api";
// import { IJsonConfig } from "applicationinsights/out/src/shim/types";

// function only
import { AzureFunctionsInstrumentation } from "@azure/functions-opentelemetry-instrumentation";

process.env.APPLICATIONINSIGHTS_INSTRUMENTATION_LOGGING_LEVEL = "NONE";
process.env.APPLICATIONINSIGHTS_LOG_DESTINATION = "file+console";

if ((process.env["APPLICATIONINSIGHTS_CONNECTION_STRING"] || process.env["AI_CONNECTION_STRING"])
   && !process.env["DISABLE_AI_SDK"]) {
  console.log("using opetelemetry");

  // setup sampling percentage from environment, see
  // https://github.com/microsoft/ApplicationInsights-node.js?tab=readme-ov-file#configuration
  // for other options. environment variable is in JSON format and takes
  // precedence over applicationinsights.json
  //
  // alternatively, you can use 
  // ai.setup("<YOUR_CONNECTION_STRING>");
  // ai.defaultClient.config.samplingPercentage = 5;
  // ai.start();
  // process.env["APPLICATIONINSIGHTS_CONFIGURATION_CONTENT"] =
  //   process.env["APPLICATIONINSIGHTS_CONFIGURATION_CONTENT"] ??
  //   JSON.stringify({
  //     samplingPercentage: 100,
  //   } satisfies Partial<IJsonConfig>);

  // setup cloudRoleName
  // process.env.OTEL_SERVICE_NAME =
  // process.env.WEBSITE_SITE_NAME ?? "local-app-service";

  // settings are taken from applicationinsights.json
  if (process.env["APPLICATIONINSIGHTS_CONNECTION_STRING"]) {
    // defaults to APPLICATIONINSIGHTS_CONNECTION_STRING
    ai.setup();
  }
  else if (process.env["AI_CONNECTION_STRING"]) {
    ai.setup(process.env["AI_CONNECTION_STRING"]);
  }

  ai.defaultClient.config.samplingPercentage = Number(process.env["APPINSIGHTS_SAMPLING_PERCENTAGE"]) || 100;

  // this enables sampling for traces and custom events
  ai.defaultClient.config.azureMonitorOpenTelemetryOptions = {
    enableTraceBasedSamplingForLogs : true
  }

  ai.start();

  // instrument native node fetch
  registerInstrumentations({
    tracerProvider: trace.getTracerProvider(),
    meterProvider: metrics.getMeterProvider(),
    instrumentations: [
      new UndiciInstrumentation(),
      new AzureFunctionsInstrumentation(),
    ],
  });
}
export default ai;
