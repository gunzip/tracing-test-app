// import { useAzureMonitor } from "@azure/monitor-opentelemetry";

import * as ai from "applicationinsights";

import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { metrics, trace } from "@opentelemetry/api";

process.env.APPLICATIONINSIGHTS_INSTRUMENTATION_LOGGING_LEVEL = "NONE";
process.env.APPLICATIONINSIGHTS_LOG_DESTINATION = "file+console";

const enableLiveMetrics =
  process.env["ENABLE_LIVE_METRICS"] !== "false" &&
  process.env["ENABLE_LIVE_METRICS"] !== "0";

const samplingRatio =
  process.env.SAMPLING_RATE !== undefined &&
  !isNaN(parseFloat(process.env.SAMPLING_RATE))
    ? parseFloat(process.env.SAMPLING_RATE)
    : 1.0;

if (process.env["APPLICATIONINSIGHTS_CONNECTION_STRINGX"]) {
  console.log(
    "using opetelemetry with sampling rate: %d liveMetrics=%s",
    samplingRatio,
    enableLiveMetrics,
  );
  // Call the `useAzureMonitor()` function to configure OpenTelemetry to use Azure Monitor.
  ai.useAzureMonitor({
    azureMonitorExporterOptions: {
      connectionString: process.env["APPLICATIONINSIGHTS_CONNECTION_STRINGX"],
    },
    instrumentationOptions: {
      // Instrumentations generating traces
      azureSdk: { enabled: true },
      http: { enabled: true },
      mongoDb: { enabled: true },
      mySql: { enabled: true },
      postgreSql: { enabled: true },
      redis: { enabled: false },
      redis4: { enabled: true },
    },
    // get sampling rate from environment variable
    samplingRatio,
    enableLiveMetrics,
    enableStandardMetrics: enableLiveMetrics,
    enableAutoCollectExceptions: enableLiveMetrics,
    enableAutoCollectPerformance: enableLiveMetrics,
  });

  // instrument native node fetch
  registerInstrumentations({
    tracerProvider: trace.getTracerProvider(),
    meterProvider: metrics.getMeterProvider(),
    instrumentations: [new UndiciInstrumentation()],
  });

  // const { Resource } = require("@opentelemetry/resources");
  // const {
  //   SemanticResourceAttributes,
  // } = require("@opentelemetry/semantic-conventions");
  // const customResource = new Resource({
  //   [SemanticResourceAttributes.SERVICE_NAME]: "my-service",
  //   [SemanticResourceAttributes.SERVICE_NAMESPACE]: "my-namespace",
  //   [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: "my-instance",
  // });

  // // Create a new AzureMonitorOpenTelemetryOptions object and set the resource property to the customResource object.
  // const options: AzureMonitorOpenTelemetryOptions = {
  //   resource: customResource,
  // };

  ai.setup(process.env["APPLICATIONINSIGHTS_CONNECTION_STRINGX"])
    .setSendLiveMetrics(enableLiveMetrics)
    .setAutoCollectPerformance(enableLiveMetrics, false);
  ai.defaultClient.config.samplingPercentage = samplingRatio * 100;
  ai.defaultClient.context.tags[ai.defaultClient.context.keys.cloudRole] =
    "function-test-tracing"; // process.env.WEBSITE_SITE_NAME
  ai.start();

  // does this work? no! it's a no-op
  // ai.defaultClient.setAutoPopulateAzureProperties();

  // import { registerInstrumentations } from "@opentelemetry/instrumentation";
  // import {
  //   HttpInstrumentation,
  //   HttpInstrumentationConfig,
  // } from "@opentelemetry/instrumentation-http";
  // import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
  // import { RedisInstrumentation } from "@opentelemetry/instrumentation-redis-4";

  // registerInstrumentations({
  //   instrumentations: [
  //     // Express instrumentation expects HTTP layer to be instrumented
  //     new HttpInstrumentation(),
  //     new ExpressInstrumentation(),
  //     new RedisInstrumentation(),
  //   ],
  // });
} else if (process.env["APPLICATIONINSIGHTS_CONNECTION_STRING"]) {
  console.log(
    "using application insights with sampling rate %d, liveMetrics=%s",
    samplingRatio,
    enableLiveMetrics,
  );
  ai.setup(process.env["APPLICATIONINSIGHTS_CONNECTION_STRING"])
    .setAutoDependencyCorrelation(true)
    .setInternalLogging(false, false)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, false)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, false)
    .setAutoCollectPreAggregatedMetrics(true)
    .setSendLiveMetrics(enableLiveMetrics)
    .enableWebInstrumentation(false);
  ai.defaultClient.config.samplingPercentage = samplingRatio * 100;
  ai.start();
}
export default ai;
