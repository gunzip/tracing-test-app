import * as ai from "./instrumentation";
import { CosmosClient } from "@azure/cosmos";
import * as redis from "redis";
import { app } from "@azure/functions";

ai.default.trackEvent({ name: "test-event" });

// import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);

// Environment variables for redis cache
const cacheHostName = process.env.AZURE_CACHE_FOR_REDIS_HOST_NAME;
const cachePassword = process.env.AZURE_CACHE_FOR_REDIS_ACCESS_KEY;

if (!cacheHostName) throw Error("AZURE_CACHE_FOR_REDIS_HOST_NAME is empty");
if (!cachePassword) throw Error("AZURE_CACHE_FOR_REDIS_ACCESS_KEY is empty");

const cacheConnection = redis.createClient({
  // rediss for TLS
  url: `rediss://${cacheHostName}:6380`,
  password: cachePassword,
});

// const app = express();

import * as otel from "@opentelemetry/api";

app.http("root", {
  route: "/",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (req) => ({ body: `Hello, ${req.query.get("name")}!` }),
});

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

app.http("query", {
  methods: ["GET"],
  route: "/query",
  authLevel: "anonymous",
  handler: async () => {
    const span = otel.trace.getActiveSpan();
    if (span) {
      span.addEvent("test-event", {
        eventKey: "event-value",
        spanId: span.spanContext().spanId,
      });
    }
    let r: any;
    try {
      r = await queryCollection();
    } catch (err) {
      return { jsonBody: { err } };
    }
    return { jsonBody: { r } };
  },
});

/** the following express endpoint returns a response with the status code given into query parameter */
app.http("status", {
  route: "/status",
  authLevel: "anonymous",
  handler: async (req) => {
    const status = req.query.get("status");
    if (status && typeof status === "string") {
      return { status: parseInt(status, 10), jsonBody: { status: status } };
    } else {
      return { status: 200, jsonBody: { status } };
    }
  },
});

(async function () {
  await cacheConnection.connect();
})();

/** the following endpoint connects to a redis instance and get some info about it */
app.http("redis", {
  route: "/redis",
  authLevel: "anonymous",
  handler: async () => {
    try {
      await cacheConnection.set(
        "Message",
        "Hello! The cache is working from Node.js!",
      );
      const msg = await cacheConnection.get("Message");
      return { jsonBody: { msg } };
    } catch (error) {
      return { status: 400, jsonBody: { error } };
    }
  },
});

app.http("redis-db", {
  route: "/redis-db",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async () => {
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

      return { status: 200, jsonBody: { msg, data } };
    } catch (error) {
      return { status: 400, jsonBody: { error } };
    }
  },
});

process.on("SIGINT", async () => {
  await cacheConnection.disconnect();
  process.exit();
});
