import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function listViews() {
  const subdomain = process.env.ZENDESK_SUBDOMAIN;
  const email = process.env.ZENDESK_EMAIL;
  const apiToken = process.env.ZENDESK_API_TOKEN;

  const authString = `${email}/token:${apiToken}`;
  const encoded = Buffer.from(authString).toString("base64");

  try {
    const response = await axios.get(
      `https://${subdomain}.zendesk.com/api/v2/views.json`,
      {
        headers: {
          Authorization: `Basic ${encoded}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Available views:");
    const callcenterViews = response.data.views.filter(
      (view: any) =>
        view.title.toLowerCase().includes("callcenter") ||
        view.title.toLowerCase().includes("call center") ||
        view.title.toLowerCase().includes("rapporter")
    );

    if (callcenterViews.length > 0) {
      console.log("\nFound Call Center related views:");
      callcenterViews.forEach((view: any) => {
        console.log(
          `- ID: ${view.id}, Title: "${view.title}", Active: ${view.active}`
        );
      });
    }

    console.log("\nAll views:");
    response.data.views.forEach((view: any) => {
      console.log(
        `- ID: ${view.id}, Title: "${view.title}", Active: ${view.active}`
      );
    });
  } catch (error: any) {
    console.error(
      "Failed to list views:",
      error.response?.status,
      error.response?.data
    );
  }
}

listViews();
