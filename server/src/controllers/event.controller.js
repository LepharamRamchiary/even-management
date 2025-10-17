import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";

const createEvent = asyncHandler(async (req, res) => {
  const {
    createdBy,
    participants,
    timezone,
    startDate,
    startTime,
    endDate,
    endTime,
  } = req.body;

  if (
    !timezone ||
    !startDate ||
    !startTime ||
    !endDate ||
    !endTime
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const event = await Event.create({
    createdBy,
    participants: participants || [],
    timezone,
    startDate,
    startTime,
    endDate,
    endTime,
  });

  if (!event) {
    throw new ApiError(500, "Something went wrong when creating event");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, event, "Event created successfully"));
});

export { createEvent };
