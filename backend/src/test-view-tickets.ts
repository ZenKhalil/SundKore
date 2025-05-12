import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function testViewTickets() {
  const subdomain = process.env.ZENDESK_SUBDOMAIN;
  const email = process.env.ZENDESK_EMAIL;
  const apiToken = process.env.ZENDESK_API_TOKEN;
  const viewId = process.env.ZENDESK_CALLCENTER_VIEW_ID;

  const authString = `${email}/token:${apiToken}`;
  const encoded = Buffer.from(authString).toString("base64");

  try {
    // Get tickets from the view
    const response = await axios.get(
      `https://${subdomain}.zendesk.com/api/v2/views/${viewId}/tickets.json`,
      {
        headers: {
          Authorization: `Basic ${encoded}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      `Found ${response.data.tickets.length} tickets in view ${viewId}`
    );

    // Check each ticket for attachments
    for (const ticket of response.data.tickets.slice(0, 5)) {
      // Check first 5 tickets
      console.log(`\nTicket #${ticket.id}: ${ticket.subject}`);

      // Get ticket comments to find attachments
      const commentsResponse = await axios.get(
        `https://${subdomain}.zendesk.com/api/v2/tickets/${ticket.id}/comments.json`,
        {
          headers: {
            Authorization: `Basic ${encoded}`,
            "Content-Type": "application/json",
          },
        }
      );

      for (const comment of commentsResponse.data.comments) {
        if (comment.attachments && comment.attachments.length > 0) {
          console.log("  Attachments:");
          comment.attachments.forEach((att: any) => {
            console.log(`    - ${att.file_name} (${att.content_type})`);
          });
        }
      }
    }
  } catch (error: any) {
    console.error("Error:", error.response?.status, error.response?.data);
  }
}

testViewTickets();
