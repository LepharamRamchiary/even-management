import { Router } from "express";
import { createEvent, getEvents, getUserEvents } from "../controllers/event.controller.js";

const router = Router();

router.post("/", createEvent);
router.get("/", getEvents);
router.get("/:id", getUserEvents);

export default router;
