import {
  UnauthenticatedError,
  UnauthorizedError,
} from "../errors/customErrors.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";

export const authenticate = asyncWrapper(async function (req, res, next) {
  let token = req.cookies?.token;
  const auth = req.get("authorization");

  if (!token && auth?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) throw new UnauthenticatedError("You are not authenticated");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new UnauthenticatedError("Invalid or expired token");
  }

  const user = await User.findById(payload.userId).select("+passwordChangedAt");
  if (!user) throw new UnauthenticatedError("Invalid or expired token");

  if (user.changedPasswordAfter(payload.iat))
    throw new UnauthenticatedError(
      "User changed password recently. Please log in again"
    );

  req.user = {
    _id: user._id,
    name: user.name, // for ai controller
    email: user.email,
    role: user.role,
  };
  next();
});

export const restrict = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError(
        "You do not have permission to perform this action"
      );
    }
    next();
  };
};
