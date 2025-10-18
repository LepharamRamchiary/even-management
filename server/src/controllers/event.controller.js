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
  const {
    userId,
    startDate,
    startTime,
    endDate,
    endTime,
    timezone,
    participants,
  } = req.body;

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

  const changes = {};
  if (startDate && startDate !== event.startDate) changes.startDate = startDate;
  if (startTime && startTime !== event.startTime) changes.startTime = startTime;
  if (endDate && endDate !== event.endDate) changes.endDate = endDate;
  if (endTime && endTime !== event.endTime) changes.endTime = endTime;
  if (timezone && timezone !== event.timezone) changes.timezone = timezone;
  if (
    participants &&
    JSON.stringify(participants) !== JSON.stringify(event.participants)
  ) {
    changes.participants = participants;
  }

  if (Object.keys(changes).length === 0) {
    throw new ApiError(400, "No fields have been changed");
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    {
      $set: changes,
      $push: {
        updateHistory: {
          updatedBy: userId,
          updatedAt: new Date(),
          changes: changes,
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("createdBy participants", "name");

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

const getUserEventHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const events = await Event.find({
    $or: [
      { createdBy: userId },
      { participants: userId },
      { 'updateHistory.updatedBy': userId }
    ]
  })
  .populate('createdBy', 'name')
  .populate('participants', 'name')
  .populate('updateHistory.updatedBy', 'name')
  .select('updateHistory createdBy participants startDate endDate startTime endTime timezone');

  if (!events) {
    throw new ApiError(404, "No events found for this user");
  }

  const formattedHistory = events.map(event => {
    const eventHistory = event.updateHistory.map(entry => ({
      eventId: event._id,
      updatedBy: entry.updatedBy.name,
      updatedAt: new Date(entry.updatedAt).toLocaleString(),
      changes: Object.entries(entry.changes).map(([field, newValue]) => {
        let readableField = field.charAt(0).toUpperCase() + field.slice(1);
        let formattedValue = newValue;

        if (field.includes('Date')) {
          formattedValue = new Date(newValue).toLocaleDateString();
        } else if (field === 'participants') {
          formattedValue = 'Participants list updated';
        }

        return {
          field: readableField,
          newValue: formattedValue
        };
      })
    }));

    return {
      eventId: event._id,
      eventCreator: event.createdBy.name,
      userRole: event.createdBy._id.toString() === userId ? 'Creator' : 'Participant',
      updates: eventHistory
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200, 
      {
        userId,
        totalEvents: events.length,
        totalUpdates: formattedHistory.reduce((acc, event) => acc + event.updates.length, 0),
        eventHistory: formattedHistory
      },
      "User's event history fetched successfully"
    )
  );
});


export { createEvent, getEvents, getUserEvents, updateEvent, deleteEvent, getUserEventHistory };
