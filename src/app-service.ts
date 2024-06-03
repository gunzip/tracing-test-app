import ai from "./instrumentation";

import { CosmosClient } from "@azure/cosmos";
import express from "express";
import * as redis from "redis";

import type { Request, Response } from "express";

// import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);

// Environment variables for redis cache
const cacheHostName = process.env.AZURE_CACHE_FOR_REDIS_HOST_NAME;
const cachePassword = process.env.AZURE_CACHE_FOR_REDIS_ACCESS_KEY;

if (!cacheHostName) throw Error("AZURE_CACHE_FOR_REDIS_HOST_NAME is empty");
if (!cachePassword) throw Error("AZURE_CACHE_FOR_REDIS_ACCESS_KEY is empty");

/////// LOGGER

// import { SeverityNumber } from "@opentelemetry/api-logs";
// import { logs } from "@opentelemetry/api-logs";

// const trackCustomEvent = (
//   name: string,
//   properties: Record<string, string>,
//   loggerName = "default",
// ) => {
//   const data /* TelemetryEventData */ = {
//     // event name
//     name,
//     // required even if it has a default value
//     version: 2,
//   };
//   logs.getLogger(loggerName).emit({
//     severityNumber: SeverityNumber.INFO,
//     severityText: "INFO",
//     body: JSON.stringify(data),
//     attributes: { ...properties, "_MS.baseType": "EventData" },
//   });
// };

const cacheConnection = redis.createClient({
  // rediss for TLS
  url: `rediss://${cacheHostName}:6380`,
  password: cachePassword,
  socket: {
    connectTimeout: 10000, // Connection timeout in milliseconds
    reconnectStrategy: (retries) => {
      if (retries >= 10) {
        return new Error("Max retries reached");
      }
      return Math.min(retries * 50, 500); // Exponential backoff
    },
  },
});

cacheConnection.on("error", (err) => {
  console.error("Redis client error:", err);
});

cacheConnection.connect().catch((err) => {
  console.error("Could not connect to Redis:", err);
});

const app = express();

//////////////

// import * as otel from "@opentelemetry/api";

// async function fetchWithTracing(
//   url: string,
//   init?: RequestInit,
// ): Promise<globalThis.Response> {
//   // Ottiene il contesto attivo di OpenTelemetry
//   const currentContext = otel.context.active();

//   // Prepara gli header di tracciamento utilizzando il propagatore di OpenTelemetry
//   const headersWithTracing = {};
//   otel.propagation.inject(currentContext, headersWithTracing);

//   // Aggiunge gli header di tracciamento agli header della richiesta originale
//   const initWithTracing = {
//     ...init,
//     headers: {
//       ...(init?.headers || {}),
//       ...headersWithTracing,
//     },
//   };

//   return fetch(url, initWithTracing);
// }

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

app.get("/", (_: Request, res: Response) => {
  ai.defaultClient.trackEvent({
    name: "custom.event",
    properties: {
      customKey1: "customValue1",
      customKey2: "customValue2",
    },
  });
  //
  // loggerProvider.shutdown();
  res.send("Hello World!!!");
});

const port: string | number = process.env.PORT || 3000;

app.listen(port, () => console.log(`App listening on port ${port}`));

// Query cosmos db

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

/** the following express endpoint returns a response with the status code given into query parameter */
app.get("/status", (req: Request, res: Response) => {
  const status = req.query.status;
  if (status && typeof status === "string") {
    res.status(parseInt(status, 10)).send({ status: status });
  } else {
    res.status(200).send({ status: status });
  }
});

/** the following endpoint connects to a redis instance and get some info about it */
app.get("/redis", async (_: Request, res: Response) => {
  try {
    await cacheConnection.set(
      "Message",
      "Hello! The cache is working from Node.js!",
    );
    const msg = await cacheConnection.get("Message");
    res.send(msg);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/redis-fetch", async (_: Request, res: Response) => {
  try {
    await cacheConnection.set(
      "Message",
      "Hello! The v2 cache is working from Node.js!",
    );
    const msg = await cacheConnection.get("Message");

    // we call the internal endpoint to query
    const data = await fetch(
      process.env.WEBSITE_HOSTNAME
        ? `https://${process.env.WEBSITE_HOSTNAME}/query`
        : "http://localhost:3000/query",
    ).then((r) => r.json());

    res.send(msg + JSON.stringify(data));
  } catch (error) {
    res.status(400).send(error);
  }
});

process.on("SIGINT", async () => {
  await cacheConnection.disconnect();
  process.exit();
});
