// import { useAzureMonitor } from "@azure/monitor-opentelemetry";

import { useAzureMonitor, setup, defaultClient } from "applicationinsights";

process.env.APPLICATIONINSIGHTS_INSTRUMENTATION_LOGGING_LEVEL = "NONE";

const aiConnectionString =
  process.env["APPLICATIONINSIGHTS_CONNECTION_STRING"] ||
  "<your connection string>";

// Call the `useAzureMonitor()` function to configure OpenTelemetry to use Azure Monitor.
useAzureMonitor({
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

// does this work?
defaultClient.setAutoPopulateAzureProperties();

setup(aiConnectionString).start();

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
export default defaultClient;
