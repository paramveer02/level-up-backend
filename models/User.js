import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({});

const User = mongoose.model("User", userSchema);
export default User;
