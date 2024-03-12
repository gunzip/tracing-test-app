import { CosmosClient } from "@azure/cosmos";
import express from "express";
import * as redis from "redis";

import type { Request, Response } from "express";

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

(async function () {
  await cacheConnection.connect();
})();

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

process.on("SIGINT", async () => {
  await cacheConnection.disconnect();
  process.exit();
});
