import { useAzureMonitor } from "@azure/monitor-opentelemetry";

// Call the `useAzureMonitor()` function to configure OpenTelemetry to use Azure Monitor.
useAzureMonitor({
  azureMonitorExporterOptions: {
    connectionString:
      process.env["APPLICATIONINSIGHTS_CONNECTION_STRING"] ||
      "<your connection string>",
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
});

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
