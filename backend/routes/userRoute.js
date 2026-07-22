import express from "express";
import {
  registerUser,
  loginUser,
  refreshToken,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/refresh-token", refreshToken);

export default userRouter;
