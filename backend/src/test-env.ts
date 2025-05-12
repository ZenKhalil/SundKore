import dotenv from "dotenv";
import path from "path";

// Load environment variables from the .env file in the backend directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

console.log("Environment variables test:");
console.log("Current directory:", __dirname);
console.log(".env file path:", path.join(__dirname, "..", ".env"));
console.log("ZENDESK_SUBDOMAIN:", process.env.ZENDESK_SUBDOMAIN);
console.log("ZENDESK_EMAIL:", process.env.ZENDESK_EMAIL);
console.log(
  "ZENDESK_API_TOKEN:",
  process.env.ZENDESK_API_TOKEN ? "SET" : "NOT SET"
);
console.log(
  "ZENDESK_CALLCENTER_VIEW_ID:",
  process.env.ZENDESK_CALLCENTER_VIEW_ID
);
