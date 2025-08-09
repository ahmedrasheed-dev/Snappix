import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { ApiError } from "./ApiError";
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

const sendOTPEmail = async (
  toEmail,
  subject = "Your One-Time Password (OTP)",
  otp
) => {
  try {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "OTP-template.html"
    );
    const rawTemp = fs.readFileSync(templatePath, "utf8");
    const finalTemplate = rawTemp.replace("{{OTP_CODE}}", otp);
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
    throw new ApiError(500, "Failed to send email").send(res);
  }
};

const sendPasswordResetEmail = async (userEmail, username, otpCode) => {
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
    throw new ApiError(500, "Failed to send email").send(res);
  }
};

export { sendOTPEmail, sendPasswordResetEmail };
