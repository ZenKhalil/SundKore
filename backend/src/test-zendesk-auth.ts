import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function testZendeskAuth() {
  const subdomain = process.env.ZENDESK_SUBDOMAIN;
  const email = process.env.ZENDESK_EMAIL;
  const apiToken = process.env.ZENDESK_API_TOKEN;

  console.log("Testing Zendesk authentication...");
  console.log("Subdomain:", subdomain);
  console.log("Email:", email);
  console.log("Token length:", apiToken?.length);

  const authString = `${email}/token:${apiToken}`;
  const encoded = Buffer.from(authString).toString("base64");

  try {
    // Test with a simple endpoint
    const response = await axios.get(
      `https://${subdomain}.zendesk.com/api/v2/users/me.json`,
      {
        headers: {
          Authorization: `Basic ${encoded}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Success! User:", response.data.user.email);
  } catch (error: any) {
    console.error(
      "Authentication failed:",
      error.response?.status,
      error.response?.data
    );

    // If 401, there might be an issue with the token
    if (error.response?.status === 401) {
      console.error("\nPossible issues:");
      console.error("1. API token is invalid or expired");
      console.error("2. Email format is incorrect");
      console.error("3. You need to generate a new API token in Zendesk");
    }
  }
}

testZendeskAuth();
