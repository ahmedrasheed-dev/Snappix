// get-token.js
import { google } from "googleapis";
import path from "path";
import { readFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();
//to get refreshToken one time from google

const OAuth2 = google.auth.OAuth2;

const credentials = {
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uris: ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"],
};

const oauth2Client = new OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

const scopes = ["https://mail.google.com/"];
const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
});

console.log("Authorize this app by visiting this url:", url);

// After you visit the URL and get the code, run this part
import Readline from "readline";
const readline = Readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question("Enter the code from that page here: ", (code) => {
  oauth2Client.getToken(code, (err, tokens) => {
    if (err) return console.error("Error retrieving access token", err);
    console.log("Refresh Token:", tokens.refresh_token);
    console.log("\nUse this in your nodemailer config.");
    process.exit(0);
  });
});

