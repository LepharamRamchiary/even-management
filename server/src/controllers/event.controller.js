import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";
import mongoose from "mongoose";

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

  if (!timezone || !startDate || !startTime || !endDate || !endTime) {
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

const getEvents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const events = await Event.find().skip(skip).limit(limit);

  const totalEvents = await Event.countDocuments();
  const totalPages = Math.ceil(totalEvents / limit);

  if (!events) {
    throw new ApiError(500, "Something went wrong when getting events");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        events,
        currentPage: page,
        totalPages,
        totalEvents,
        eventsPerPage: limit,
      },
      "Events fetched successfully"
    )
  );
});

const getUserEvents = asyncHandler(async (req, res) => {
  const { id } = req.params;
  //   console.log(id);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid user id");
  }

  const events = await Event.find({
    $or: [{ createdBy: id }, { participants: id }],
  }).populate("createdBy participants", "name");

  return res
    .status(200)
    .json(new ApiResponse(200, events, "Events fetched successfully"));
});

const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, startDate, startTime, endDate, endTime, timezone } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid event id");
  }

  if (!userId) {
    throw new ApiError(400, "userId is required to update event");
  }

  const event = await Event.findById(id);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const isCreator = event.createdBy.toString() === userId;
  const isParticipant = event.participants.some((p) => p.toString() === userId);

  if (!isCreator && !isParticipant) {
    throw new ApiError(403, "You are not allowed to update this event");
  }

  const updatedEvent = await Event.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        startDate: startDate || undefined,
        startTime: startTime || undefined,
        endDate: endDate || undefined,
        endTime: endTime || undefined,
        timezone: timezone || undefined,
      },
    },
    { new: true }
  );

  if (!updatedEvent) {
    throw new ApiError(404, "Event not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid event id");
  }

  if (!userId) {
    throw new ApiError(400, "userId is required to delete event");
  }

  const event = await Event.findById(id);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const isCreator = event.createdBy.toString() === userId;
  const isParticipant = event.participants.some((p) => p.toString() === userId);

  if (!isCreator && !isParticipant) {
    throw new ApiError(403, "You are not allowed to delete this event");
  }

  await Event.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Event deleted successfully"));
});

export { createEvent, getEvents, getUserEvents, updateEvent, deleteEvent };
