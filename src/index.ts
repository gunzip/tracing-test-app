import express, { Request, Response } from "express";

// Import the `useAzureMonitor()` function from the `@azure/monitor-opentelemetry` package.
import { useAzureMonitor } from "@azure/monitor-opentelemetry";

const app = express();

app.get("/", (req: Request, res: Response) => res.send("Hello World!!"));

const port: string | number = process.env.PORT || 3000;

app.listen(port, () => console.log(`App listening on port ${port}`));

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
    redis: { enabled: true },
    redis4: { enabled: true },
  },
  samplingRatio: 1.0,
  enableLiveMetrics: true,
  enableStandardMetrics: true,
});

// import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
// import { registerInstrumentations } from "@opentelemetry/instrumentation";
// import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
// import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";

// const provider = new NodeTracerProvider();
// provider.register();

// registerInstrumentations({
//   instrumentations: [
//     // Express instrumentation expects HTTP layer to be instrumented
//     new HttpInstrumentation(),
//     new ExpressInstrumentation(),
//   ],
// });
