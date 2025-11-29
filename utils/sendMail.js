import nodemailer from "nodemailer";
import { asyncWrapper } from "./asyncWrapper.js";

// Create a pooled transporter once and reuse it
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

export const sendMail = asyncWrapper(async function (options) {
  const mailOptions = {
    from: "Team Balance. paramveermarwahafc@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
});
