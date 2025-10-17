import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//json data
app.use(express.json());

// routes import
import userRouter from "./routes/user.route.js";
import eventRouter from "./routes/event.route.js";

// routes declaration
app.use("/api/user", userRouter);
app.use("/api/events", eventRouter);

export { app };
