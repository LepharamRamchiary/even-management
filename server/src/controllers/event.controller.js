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
    createdBy,
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

  if (createdBy && createdBy !== event.createdBy.toString()) {
    changes.createdBy = {
      oldValue: event.createdBy,
      newValue: createdBy,
    };
  }

  if (startDate && startDate !== event.startDate) {
    changes.startDate = {
      oldValue: event.startDate,
      newValue: startDate,
    };
  }

  if (startTime && startTime !== event.startTime) {
    changes.startTime = {
      oldValue: event.startTime,
      newValue: startTime,
    };
  }

  if (endDate && endDate !== event.endDate) {
    changes.endDate = {
      oldValue: event.endDate,
      newValue: endDate,
    };
  }

  if (endTime && endTime !== event.endTime) {
    changes.endTime = {
      oldValue: event.endTime,
      newValue: endTime,
    };
  }

  if (timezone && timezone !== event.timezone) {
    changes.timezone = {
      oldValue: event.timezone,
      newValue: timezone,
    };
  }

  if (
    participants &&
    JSON.stringify(participants.sort()) !==
      JSON.stringify(event.participants.map((p) => p.toString()).sort())
  ) {
    changes.participants = {
      oldValue: event.participants,
      newValue: participants,
    };
  }

  if (Object.keys(changes).length === 0) {
    throw new ApiError(400, "No fields have been changed");
  }

  const updateFields = {};
  Object.keys(changes).forEach((key) => {
    updateFields[key] = changes[key].newValue;
  });

  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    {
      $set: updateFields,
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

const getEventHistory = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid event id");
  }

  const event = await Event.findById(id)
    .populate({
      path: "updateHistory.updatedBy",
      select: "name",
    })
    .populate("createdBy", "name")
    .populate("participants", "name")
    .select("updateHistory createdBy participants");

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const isCreator = event.createdBy._id.toString() === userId;
  const isParticipant = event.participants.some(
    (p) => p._id.toString() === userId
  );

  if (!isCreator && !isParticipant) {
    throw new ApiError(403, "You are not allowed to view this event's history");
  }

  const formattedHistory = event.updateHistory.map((entry) => {
    const changeDetails = Object.entries(entry.changes).map(
      ([field, valueObj]) => {
        let oldValue, newValue;

        if (
          valueObj &&
          typeof valueObj === "object" &&
          "oldValue" in valueObj
        ) {
          oldValue = valueObj.oldValue;
          newValue = valueObj.newValue;
        } else {
          oldValue = "N/A";
          newValue = valueObj;
        }

        let readableField = field;

        switch (field) {
          case "createdBy":
            readableField = "Event Creator";
            if (oldValue && oldValue !== "N/A") {
              const oldCreator =
                event.createdBy._id.toString() === oldValue.toString()
                  ? event.createdBy
                  : event.participants.find(
                      (p) => p._id.toString() === oldValue.toString()
                    );
              oldValue = oldCreator ? oldCreator.name : oldValue;
            }

            if (newValue) {
              const newCreator =
                event.createdBy._id.toString() === newValue.toString()
                  ? event.createdBy
                  : event.participants.find(
                      (p) => p._id.toString() === newValue.toString()
                    );
              newValue = newCreator ? newCreator.name : newValue;
            }
            break;

          case "startDate":
          case "endDate":
            if (oldValue && oldValue !== "N/A") {
              oldValue = new Date(oldValue).toLocaleDateString();
            }
            if (newValue) {
              newValue = new Date(newValue).toLocaleDateString();
            }
            readableField = field === "startDate" ? "Start Date" : "End Date";
            break;

          case "startTime":
            readableField = "Start Time";
            break;

          case "endTime":
            readableField = "End Time";
            break;

          case "timezone":
            readableField = "Timezone";
            break;

          case "participants":
            readableField = "Participants";
            if (oldValue && oldValue !== "N/A" && Array.isArray(oldValue)) {
              const oldParticipants = event.participants.filter((p) =>
                oldValue.some((id) => id.toString() === p._id.toString())
              );
              oldValue =
                oldParticipants.map((p) => p.name).join(", ") || "None";
            } else if (oldValue === "N/A") {
              oldValue = "N/A";
            } else {
              oldValue = "None";
            }

            if (newValue && Array.isArray(newValue)) {
              const newParticipants = event.participants.filter((p) =>
                newValue.some((id) => id.toString() === p._id.toString())
              );
              newValue =
                newParticipants.map((p) => p.name).join(", ") || "None";
            } else {
              newValue = "None";
            }
            break;
        }

        return {
          field: readableField,
          oldValue: oldValue || "—",
          newValue: newValue || "—",
          changeType: "Modified",
        };
      }
    );

    return {
      updatedBy: entry.updatedBy?.name || "Unknown",
      updatedAt: new Date(entry.updatedAt).toLocaleString(),
      changes: changeDetails,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        eventId: event._id,
        createdBy: event.createdBy.name,
        userRole: isCreator ? "Creator" : "Participant",
        totalChanges: formattedHistory.length,
        history: formattedHistory,
      },
      "Event history fetched successfully"
    )
  );
});

export {
  createEvent,
  getEvents,
  getUserEvents,
  updateEvent,
  deleteEvent,
  getEventHistory,
};
