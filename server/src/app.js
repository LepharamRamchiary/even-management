import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

//json data
app.use(express.json());

// routes import
import userRouter from "./routes/user.route.js";
import eventRouter from "./routes/event.route.js";

// routes declaration
app.use("/api/user", userRouter);
app.use("/api/events", eventRouter);

export { app };
