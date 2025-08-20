import { StatusCodes } from "http-status-codes";

const notFound = (req, res) => {
  return res.status(StatusCodes.NOT_FOUND).json({ message: "Invalid Route" });
};

export default notFound;
