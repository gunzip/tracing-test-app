import express, { Request, Response } from "express";

// Import the `useAzureMonitor()` function from the `@azure/monitor-opentelemetry` package.
import { useAzureMonitor } from "@azure/monitor-opentelemetry";

const app = express();

/** this is an express middleware that takes the query parameter named 'delay'
 * from the query string and delays the response by that amount of time in milliseconds.
 */
app.use((req, _, next) => {
  const delay = req.query.delay;
  if (delay && typeof delay === "string") {
    setTimeout(next, parseInt(delay, 10));
  } else {
    next();
  }
});

app.get("/", (req: Request, res: Response) => res.send("Hello World!!!"));

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

// Query cosmos db

import { CosmosClient } from "@azure/cosmos";
const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING ?? "");

async function queryCollection() {
  const { database } = await client.databases.createIfNotExists({
    id: "SampleDB",
  });
  const { container } = await database.containers.createIfNotExists({
    id: "Persons",
  });

  const querySpec = {
    query: "SELECT * FROM c WHERE c.firstname = @value",
    parameters: [
      {
        name: "@value",
        value: "Eva",
      },
    ],
  };

  const { resources: items } = await container.items
    .query(querySpec)
    .fetchAll();

  return items;
}

app.get("/query", (_: Request, res: Response) => {
  queryCollection()
    .catch((err) => {
      res.json(JSON.stringify(err));
    })
    .then((r) => {
      res.json(JSON.stringify(r));
    });
});
