import jwt from "jsonwebtoken";

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

export const createSendToken = function (user, statusCode, res) {
  const token = signToken(user._id);

  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 5,
  });

  user.password = undefined;
  return res.status(statusCode).json({ status: "success", token, user });
};
