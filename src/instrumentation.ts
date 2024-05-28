// import { useAzureMonitor } from "@azure/monitor-opentelemetry";

import * as ai from "applicationinsights";

import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { metrics, trace } from "@opentelemetry/api";

process.env.APPLICATIONINSIGHTS_INSTRUMENTATION_LOGGING_LEVEL = "NONE";
process.env.APPLICATIONINSIGHTS_LOG_DESTINATION = "file+console";

if (process.env["APPLICATIONINSIGHTS_CONNECTION_STRINGX"]) {
  console.log("using opetelemetry");
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
    samplingRatio: process.env.SAMPLING_RATE
      ? parseFloat(process.env.SAMPLING_RATE)
      : 1.0,
    enableLiveMetrics: true,
    enableStandardMetrics: true,
    enableAutoCollectExceptions: true,
    enableAutoCollectPerformance: true,
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

  ai.setup(process.env["APPLICATIONINSIGHTS_CONNECTION_STRINGX"]).start();

  // does this work?
  // ai.defaultClient.setAutoPopulateAzureProperties();

  // defaultClient.context.tags[defaultClient.context.keys.cloudRole] =
  //   "function-test-tracing";

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
  console.log("using application insights");
  ai.setup(process.env["APPLICATIONINSIGHTS_CONNECTION_STRING"])
    .setAutoDependencyCorrelation(true)
    .setInternalLogging(false, false)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, false)
    .setAutoCollectPreAggregatedMetrics(true)
    .setSendLiveMetrics(false)
    .enableWebInstrumentation(false)
    .start();
}
export default ai;
