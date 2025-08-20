import { StatusCodes } from "http-status-codes";

function errorHandler(err, req, res, next) {
  console.log(err);

  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong";

  if (err.name === "ValidationError") {
    statusCode = StatusCodes.BAD_REQUEST;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  return res.status(statusCode).json({ message });
}

export default errorHandler;
