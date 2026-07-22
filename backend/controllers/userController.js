import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import { asyncHandler } from "../middlewares/asyncHandler.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

// Register new user

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // check required fields

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  // check if user already exists

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res
      .status(409)
      .json({ success: false, message: "User already exists" });
  }

  // Validate email

  if (!validator.isEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter a valid email" });
  }

  // Validate password

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters",
    });
  }

  // Hashing user password

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Creating user

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  return res
    .status(201)
    .json({ success: true, message: "User registered successfully" });
});

// Login existing user

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check required fields

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email & Password are required" });
  }

  // Check user exists

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  // Compare password

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  // Generate  access token

  const accessToken = generateAccessToken(user._id);

  // Generate refresh token

  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Login successful",
    accessToken,
    refreshToken,
  });
});

// Refresh token

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token required",
    });
  }

  const user = await User.findOne({
    refreshToken,
  });

  if (!user) {
    return res.status(403).json({
      message: "Invalid refresh token",
    });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: "Refresh token expired",
      });
    }

    const newAccessToken = generateAccessToken(decoded.userId);

    res.json({
      accessToken: newAccessToken,
    });
  });
});
