import express, { Request, Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => res.send("Hello World!"));

const port: string | number = process.env.PORT || 3000;

app.listen(port, () => console.log(`App listening on port ${port}`));
