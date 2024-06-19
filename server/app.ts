import express, { Express, Request, Response } from "express";
import path from "path";
import cors from "cors";
import morgan from "morgan";

const app: Express = express();

app.use(
  cors({
    origin: "*",
  })
);

app.enable("trust proxy");
app.use(morgan("combined"));

// Frontend as staticfiles
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.static(path.join(__dirname, "../../client/dist")));

app.get("/*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../client/dist", "index.html"));
});

// Server images staticfiles directory
app.use(express.static("public"));

export default app;
