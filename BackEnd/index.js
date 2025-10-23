import dbConnect from "./db/dbUtil.js";
import dotenv from "dotenv";
import server from "./app.js";

dotenv.config({
  path: "./.env",
});

dbConnect()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    if (process.env.RUNTIME === "DEV") {
      server.listen(PORT, () => {
        console.log(`Server is running in Devoplment on port ${PORT}`);
      });
    }
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with failure
  });
