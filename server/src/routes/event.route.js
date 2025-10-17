import { Router } from "express";
import { createEvent, getEvents } from "../controllers/event.controller.js";

const router = Router();

router.post("/", createEvent);
router.get("/", getEvents);

export default router;
