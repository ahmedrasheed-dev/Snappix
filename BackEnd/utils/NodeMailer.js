import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sendOTPEmail = async (
  toEmail,
  otp,
  OTP_EXPIRY,
  subject = "Your One-Time Password (OTP)"
) => {
  try {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "OTP-template.html"
    );
    const rawTemp = fs.readFileSync(templatePath, "utf8");
    const finalTemplate = rawTemp
      .replace("{{OTP_CODE}}", otp)
      .replace("{{OTP_EXPIRY}}", OTP_EXPIRY);
    const mailOptions = {
      from: process.env.GMAIL_USER, // The sender's email address
      to: toEmail, // The recipient's email address
      subject: subject,
      html: finalTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError(500, "Failed to send email");
  }
};

const sendPasswordResetEmail = async (
  userEmail,
  username,
  otpCode,
  OTP_EXPIRY
) => {
  try {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "Password-reset-template.html"
    );
    let htmlTemplate = fs.readFileSync(templatePath, "utf8");

    // Replace the placeholders
    htmlTemplate = htmlTemplate.replace("{{USERNAME}}", username);
    htmlTemplate = htmlTemplate.replace("{{OTP_CODE}}", otpCode);
    htmlTemplate = htmlTemplate.replace("{{OTP_EXPIRY}}", OTP_EXPIRY);

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: "Password Reset Request",
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError(500, "Failed to send email");
  }
};

export { sendOTPEmail, sendPasswordResetEmail };
