import { Router } from "express";
import {
  createEvent,
  getEvents,
  getUserEvents,
  updateEvent,
  deleteEvent
} from "../controllers/event.controller.js";

const router = Router();

router.post("/", createEvent);
router.get("/", getEvents);
router.get("/:id", getUserEvents);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
