// import { useAzureMonitor } from "@azure/monitor-opentelemetry";

import * as ai from "applicationinsights";

process.env.APPLICATIONINSIGHTS_INSTRUMENTATION_LOGGING_LEVEL = "NONE";
process.env.APPLICATIONINSIGHTS_LOG_DESTINATION = "file+console";

const aiConnectionString =
  process.env["APPLICATIONINSIGHTS_CONNECTION_STRINGX"] ||
  "<your connection string>";

// Call the `useAzureMonitor()` function to configure OpenTelemetry to use Azure Monitor.
ai.useAzureMonitor({
  azureMonitorExporterOptions: {
    connectionString: aiConnectionString,
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
  samplingRatio: 1.0,
  enableLiveMetrics: true,
  enableStandardMetrics: true,
  enableAutoCollectExceptions: true,
  enableAutoCollectPerformance: true,
});

import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { metrics, trace } from "@opentelemetry/api";

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

ai.setup(aiConnectionString)
  // .setAutoDependencyCorrelation(true)
  // .setInternalLogging(true, true)
  // .setAutoCollectRequests(true)
  // .setAutoCollectPerformance(true, true)
  // .setAutoCollectExceptions(true)
  // .setAutoCollectDependencies(true)
  // .setAutoCollectConsole(true, false)
  // .setAutoCollectPreAggregatedMetrics(true)
  // .setSendLiveMetrics(false)
  // .enableWebInstrumentation(false)
  .start();

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
export default ai;
