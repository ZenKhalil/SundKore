import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export interface CallCenterReport {
  ticket: ZendeskTicket;
  pdfBuffer: Buffer;
  fileName: string;
  reportDate: Date;
}

interface ZendeskTicket {
  id: number;
  subject: string;
  created_at: string;
  attachments: ZendeskAttachment[];
}

interface ZendeskAttachment {
  id: number;
  file_name: string;
  content_url: string;
  content_type: string;
  size: number;
}

export class ZendeskService {
  private readonly subdomain: string;
  private readonly email: string;
  private readonly apiToken: string;
  private readonly baseUrl: string;

  constructor() {
    this.subdomain = process.env.ZENDESK_SUBDOMAIN || "";
    this.email = process.env.ZENDESK_EMAIL || "";
    this.apiToken = process.env.ZENDESK_API_TOKEN || "";

    // Log to debug
    console.log("Zendesk config:", {
      subdomain: this.subdomain,
      email: this.email,
      hasToken: !!this.apiToken,
      baseUrl: `https://${this.subdomain}.zendesk.com/api/v2`,
    });

    if (!this.subdomain || !this.email || !this.apiToken) {
      throw new Error(
        "Missing Zendesk configuration. Please check your .env file."
      );
    }

    this.baseUrl = `https://${this.subdomain}.zendesk.com/api/v2`;
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(
      `${this.email}/token:${this.apiToken}`
    ).toString("base64")}`;
  }

  async getTicketsFromView(
    viewId: string,
    daysBack?: number
  ): Promise<ZendeskTicket[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/views/${viewId}/tickets.json`,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      // Only filter tickets by creation date if daysBack is provided
      if (daysBack !== undefined) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);

        const filteredTickets = response.data.tickets.filter(
          (ticket: ZendeskTicket) => {
            const ticketDate = new Date(ticket.created_at);
            return ticketDate >= cutoffDate;
          }
        );

        return filteredTickets;
      }

      // Return all tickets if no date filter
      return response.data.tickets;
    } catch (error) {
      console.error("Error fetching tickets from view:", error);
      throw error;
    }
  }

  async getTicketComments(ticketId: number): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/tickets/${ticketId}/comments.json`,
        {
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.comments;
    } catch (error) {
      console.error("Error fetching ticket comments:", error);
      throw error;
    }
  }

  async downloadAttachment(attachmentUrl: string): Promise<Buffer> {
    try {
      const response = await axios.get(attachmentUrl, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
        responseType: "arraybuffer",
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      throw error;
    }
  }

  async getCallCenterReports(daysBack?: number): Promise<CallCenterReport[]> {
    try {
      const viewId = process.env.ZENDESK_CALLCENTER_VIEW_ID || "";
      console.log(
        `Fetching tickets from view: ${viewId}${
          daysBack !== undefined ? ` (last ${daysBack} days)` : " (all time)"
        }`
      );

      const tickets = await this.getTicketsFromView(viewId, daysBack);
      console.log(`Found ${tickets.length} tickets in view`);

      const reports: CallCenterReport[] = [];

      // Only create cutoff date if daysBack is provided
      let cutoffDate: Date | null = null;
      if (daysBack !== undefined) {
        cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);
      }

      for (const ticket of tickets) {
        console.log(`Processing ticket #${ticket.id}: ${ticket.subject}`);

        const comments = await this.getTicketComments(ticket.id);
        console.log(`  Found ${comments.length} comments`);

        for (const comment of comments) {
          if (comment.attachments) {
            console.log(`  Found ${comment.attachments.length} attachments`);

            for (const attachment of comment.attachments) {
              console.log(
                `    Checking attachment: ${attachment.file_name} (${attachment.content_type})`
              );

              // Updated condition to handle application/octet-stream
              if (
                (attachment.content_type === "application/pdf" ||
                  attachment.content_type === "application/octet-stream") &&
                attachment.file_name.match(
                  /callCenterReport_\d{6}_[\w-]+\.pdf/i
                )
              ) {
                const reportDate = this.extractDateFromFilename(
                  attachment.file_name
                );

                // Only filter by date if cutoffDate exists
                if (!cutoffDate || reportDate >= cutoffDate) {
                  console.log(
                    `    ✓ Matched call center report: ${
                      attachment.file_name
                    } (Date: ${reportDate.toISOString()})`
                  );

                  const pdfBuffer = await this.downloadAttachment(
                    attachment.content_url
                  );

                  reports.push({
                    ticket,
                    pdfBuffer,
                    fileName: attachment.file_name,
                    reportDate: reportDate,
                  });
                } else {
                  console.log(
                    `    ⚠ Skipping old report: ${
                      attachment.file_name
                    } (Date: ${reportDate.toISOString()})`
                  );
                }
              }
            }
          }
        }
      }

      console.log(`Total reports found: ${reports.length}`);

      // Sort reports by date (newest first)
      reports.sort((a, b) => b.reportDate.getTime() - a.reportDate.getTime());

      // Group reports by date to detect duplicates from the same day
      const reportsByDate = new Map<string, CallCenterReport[]>();

      reports.forEach((report) => {
        const dateKey = report.reportDate.toISOString().split("T")[0]; // YYYY-MM-DD
        if (!reportsByDate.has(dateKey)) {
          reportsByDate.set(dateKey, []);
        }
        reportsByDate.get(dateKey)!.push(report);
      });

      // If there are multiple reports for the same date, keep only the newest
      const uniqueReports: CallCenterReport[] = [];

      reportsByDate.forEach((reportsForDate, dateKey) => {
        if (reportsForDate.length > 1) {
          console.log(
            `⚠ Found ${reportsForDate.length} reports for ${dateKey}, keeping only the newest`
          );
          // Sort by filename (which includes timestamp) and take the newest
          reportsForDate.sort((a, b) => b.fileName.localeCompare(a.fileName));
          uniqueReports.push(reportsForDate[0]);
        } else {
          uniqueReports.push(reportsForDate[0]);
        }
      });

      // Final sort by date (newest first)
      uniqueReports.sort(
        (a, b) => b.reportDate.getTime() - a.reportDate.getTime()
      );

      console.log(
        `Final report count after deduplication: ${uniqueReports.length}`
      );

      return uniqueReports;
    } catch (error) {
      console.error("Error getting call center reports:", error);
      throw error;
    }
  }

  private extractDateFromFilename(filename: string): Date {
    // Extract YYMMDD and HHMMSS from filename like callCenterReport_250509_182914.pdf
    const match = filename.match(
      /callCenterReport_(\d{2})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.pdf/
    );
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      // Assuming 20xx for the year
      return new Date(
        2000 + parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );
    }

    // Fallback to date-only parsing if full timestamp not available
    const dateMatch = filename.match(/callCenterReport_(\d{2})(\d{2})(\d{2})_/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      return new Date(
        2000 + parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
    }

    console.warn(`Unable to extract date from filename: ${filename}`);
    return new Date();
  }
}
