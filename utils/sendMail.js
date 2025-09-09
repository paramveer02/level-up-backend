import nodemailer from "nodemailer";
import { asyncWrapper } from "./asyncWrapper.js";

export const sendMail = asyncWrapper(async function (options) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Team Balance. paramveermarwahafc@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
});
