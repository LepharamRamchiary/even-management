import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const addUser = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  const existingUser = await User.findOne({ name });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const user = await User.create({ name });

  if (!user) {
    throw new ApiError(500, "Something went wrong");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, user, "User created successfully"));
});

export { addUser };
