// src/services/zendesk.service.ts
import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Interfaces
export interface CallCenterReport {
  ticket: ZendeskTicket;
  pdfBuffer: Buffer;
  fileName: string;
  reportDate: Date;
}

export interface ZendeskTicket {
  id: number;
  subject: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  status?: string;
  priority?: string;
  requester_id?: number;
  submitter_id?: number;
  assignee_id?: number;
  organization_id?: number;
  group_id?: number;
  due_at?: string | null;
  tags?: string[];
  custom_fields?: any[];
  satisfaction_rating?: any;
  sharing_agreement_ids?: number[];
  followup_ids?: number[];
  via?: {
    channel: string;
    source: any;
  };
  attachments?: ZendeskAttachment[];
  ticket_form_id?: number;
  brand_id?: number;
  allow_channelback?: boolean;
  allow_attachments?: boolean;
  is_public?: boolean;
}

export interface ZendeskAttachment {
  id: number;
  file_name: string;
  content_url: string;
  content_type: string;
  size: number;
}

export interface TicketMetrics {
  id: number;
  ticket_id: number;
  created_at: string;
  updated_at: string;
  reopens: number;
  replies: number;
  assignee_updated_at: string;
  assignee_stations: number;
  group_stations: number;
  first_resolution_time_in_minutes: number;
  reply_time_in_minutes: number;
  full_resolution_time_in_minutes: number;
  agent_wait_time_in_minutes: number;
  requester_wait_time_in_minutes: number;
}

export interface TicketWithMetrics extends ZendeskTicket {
  metrics?: TicketMetrics;
}

export interface TicketStatistics {
  total: number;
  new: number;
  open: number;
  closed: number;
  pending: number;
  hold: number;
  solved: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  slaCompliance: number;
  byChannel: {
    [key: string]: number;
  };
  byPriority: {
    [key: string]: number;
  };
  monthlyActivity: {
    [key: string]: number;
  };
}

export interface TicketsResponse {
  tickets: ZendeskTicket[];
  count: number;
  nextPage?: number;
  prevPage?: number;
}

export class ZendeskService {
  private readonly subdomain: string;
  private readonly email: string;
  private readonly apiToken: string;
  private readonly baseUrl: string;
  private readonly callCenterViewId: string;

  constructor() {
    this.subdomain = process.env.ZENDESK_SUBDOMAIN || "";
    this.email = process.env.ZENDESK_EMAIL || "";
    this.apiToken = process.env.ZENDESK_API_TOKEN || "";
    this.callCenterViewId = process.env.ZENDESK_CALLCENTER_VIEW_ID || "";
    this.baseUrl = `https://${this.subdomain}.zendesk.com/api/v2`;

    // Log configuration
    console.log("Zendesk config:", {
      subdomain: this.subdomain ? this.subdomain : "MISSING",
      email: this.email ? "CONFIGURED" : "MISSING",
      hasToken: !!this.apiToken,
      callCenterViewId: this.callCenterViewId
        ? this.callCenterViewId
        : "MISSING",
      baseUrl: this.baseUrl,
    });

    if (!this.subdomain || !this.email || !this.apiToken) {
      throw new Error(
        "Missing Zendesk configuration. Please check your .env file."
      );
    }
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(
      `${this.email}/token:${this.apiToken}`
    ).toString("base64")}`;
  }

  private getRequestConfig(params: any = {}) {
    return {
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      params,
    };
  }

  /**
   * Download attachment from Zendesk
   */
  async downloadAttachment(attachmentUrl: string): Promise<Buffer> {
    try {
      console.log(`Downloading attachment from URL: ${attachmentUrl}`);

      const response = await axios.get(attachmentUrl, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
        responseType: "arraybuffer",
      });

      console.log(
        `Successfully downloaded attachment (${response.data.byteLength} bytes)`
      );
      return Buffer.from(response.data);
    } catch (error) {
      console.error("Error downloading attachment:", error);
      throw error;
    }
  }

  /**
   * Get tickets from a specific Zendesk view
   */
  async getTicketsFromView(
    viewId: string = this.callCenterViewId,
    daysBack?: number,
    page: number = 1,
    perPage: number = 100
  ): Promise<ZendeskTicket[]> {
    try {
      console.log(`Fetching tickets from view: ${viewId}, page ${page}`);

      const response = await axios.get(
        `${this.baseUrl}/views/${viewId}/tickets.json`,
        this.getRequestConfig({ page, per_page: perPage })
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

        console.log(
          `Found ${filteredTickets.length} tickets (filtered by date)`
        );
        return filteredTickets;
      }

      console.log(`Found ${response.data.tickets.length} tickets`);
      return response.data.tickets;
    } catch (error) {
      console.error("Error fetching tickets from view:", error);
      throw error;
    }
  }

  /**
   * Get call center tickets from the configured view
   */
  async getCallCenterTickets(page: number = 1, perPage: number = 100) {
    try {
      // Validate necessary configuration
      if (!this.subdomain || !this.email || !this.apiToken) {
        return {
          tickets: [],
          count: 0,
          next_page: null,
          prev_page: null,
          error:
            "Zendesk API is not configured. Check server environment variables.",
        };
      }

      // Validate call center view ID
      if (!this.callCenterViewId) {
        return {
          tickets: [],
          count: 0,
          next_page: null,
          prev_page: null,
          error:
            "Call center view ID is not configured. Check ZENDESK_CALLCENTER_VIEW_ID environment variable.",
        };
      }

      // Make the API call
      console.log(
        `Fetching call center tickets from view ${this.callCenterViewId}, page ${page}`
      );
      const response = await axios.get(
        `${this.baseUrl}/views/${this.callCenterViewId}/tickets.json`,
        this.getRequestConfig({ page, per_page: perPage })
      );

      return {
        tickets: response.data.tickets || [],
        count: response.data.count || 0,
        next_page: response.data.next_page,
        prev_page: response.data.previous_page,
      };
    } catch (error: any) {
      console.error("Error fetching call center tickets:", error);

      // Check for specific error types
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx
        console.error(
          `Zendesk API error: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );

        if (error.response.status === 401) {
          return {
            tickets: [],
            count: 0,
            next_page: null,
            prev_page: null,
            error:
              "Authentication failed. Please check your Zendesk credentials.",
          };
        } else if (error.response.status === 404) {
          return {
            tickets: [],
            count: 0,
            next_page: null,
            prev_page: null,
            error: `View ID ${this.callCenterViewId} not found. Please check your ZENDESK_CALLCENTER_VIEW_ID.`,
          };
        } else if (error.response.status === 429) {
          return {
            tickets: [],
            count: 0,
            next_page: null,
            prev_page: null,
            error: "Rate limit exceeded. Please try again later.",
          };
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received from Zendesk API:", error.request);
        return {
          tickets: [],
          count: 0,
          next_page: null,
          prev_page: null,
          error:
            "No response received from Zendesk API. Please check your network connection.",
        };
      }

      // Generic error
      return {
        tickets: [],
        count: 0,
        next_page: null,
        prev_page: null,
        error: `Failed to fetch tickets: ${error.message}`,
      };
    }
  }

  /**
   * Get all tickets with pagination
   */
  async getTickets(page: number = 1, perPage: number = 100) {
    try {
      console.log(`Fetching all tickets, page ${page}, perPage ${perPage}`);

      const response = await axios.get(
        `${this.baseUrl}/tickets.json`,
        this.getRequestConfig({
          page,
          per_page: perPage,
          include: "users,groups",
        })
      );

      return {
        tickets: response.data.tickets || [],
        count: response.data.count || 0,
        next_page: response.data.next_page,
        prev_page: response.data.previous_page,
      };
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  }

  /**
   * Get tickets by status
   */
  async getTicketsByStatus(
    status: string,
    page: number = 1,
    perPage: number = 100
  ) {
    try {
      console.log(`Fetching tickets with status: ${status}`);

      const searchQuery = `status:${status}`;
      const response = await axios.get(
        `${this.baseUrl}/search.json`,
        this.getRequestConfig({
          query: searchQuery,
          page,
          per_page: perPage,
        })
      );

      console.log(`Found ${response.data.count} tickets with status ${status}`);

      return {
        tickets: response.data.results || [],
        count: response.data.count || 0,
        next_page: response.data.next_page,
        prev_page: response.data.previous_page,
      };
    } catch (error) {
      console.error(`Error fetching tickets with status ${status}:`, error);
      throw error;
    }
  }

  /**
   * Get a ticket by ID
   */
  async getTicketById(id: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/tickets/${id}.json`,
        this.getRequestConfig()
      );

      return {
        ticket: response.data.ticket,
      };
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get ticket comments
   */
  async getTicketComments(ticketId: number): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/tickets/${ticketId}/comments.json`,
        this.getRequestConfig()
      );

      return response.data.comments;
    } catch (error) {
      console.error("Error fetching ticket comments:", error);
      throw error;
    }
  }

  /**
   * Get ticket metrics
   */
  async getTicketMetrics(page: number = 1, perPage: number = 100) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/ticket_metrics.json`,
        this.getRequestConfig({ page, per_page: perPage })
      );

      return {
        ticket_metrics: response.data.ticket_metrics,
        count: response.data.count,
        next_page: response.data.next_page,
        prev_page: response.data.previous_page,
      };
    } catch (error) {
      console.error("Error fetching ticket metrics:", error);
      throw error;
    }
  }

  /**
   * Get call center reports
   */
  async getCallCenterReports(daysBack?: number): Promise<CallCenterReport[]> {
    try {
      console.log(
        `Fetching call center reports${
          daysBack !== undefined ? ` (last ${daysBack} days)` : " (all time)"
        }`
      );

      const tickets = await this.getTicketsFromView(
        this.callCenterViewId,
        daysBack
      );
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

  /**
   * Find view ID by title prefix
   * This matches views that start with the specified title prefix
   */
  async findViewIdByTitlePrefix(titlePrefix: string): Promise<string | null> {
    try {
      console.log(`Looking for view with title prefix: "${titlePrefix}"`);
      const views = await this.getAllViews();

      const matchingView = views.find(
        (view) => view.title.startsWith(titlePrefix) && view.active
      );

      if (matchingView) {
        console.log(
          `Found matching view: "${matchingView.title}" (ID: ${matchingView.id})`
        );
        return matchingView.id.toString();
      }

      console.log(`No matching view found for prefix: "${titlePrefix}"`);
      return null;
    } catch (error) {
      console.error(
        `Error finding view by title prefix "${titlePrefix}":`,
        error
      );
      return null;
    }
  }

  /**
   * Calculate ticket statistics based on Zendesk views
   */
  async getTicketStatistics(): Promise<TicketStatistics> {
    try {
      console.log("Fetching data for ticket statistics from views...");

      // Dynamic view mapping
      const viewPrefixes = {
        newTickets: "Support::Nye sager",
        openTickets: "Support::Åbne sager",
        waitingTickets: "Support::Venter og Bero",
        solvedTickets: "Support::Løste sager",
      };

      // Find view IDs by titles
      console.log("Looking up view IDs by title prefixes...");
      const newTicketsViewId = await this.findViewIdByTitlePrefix(
        viewPrefixes.newTickets
      );
      const openTicketsViewId = await this.findViewIdByTitlePrefix(
        viewPrefixes.openTickets
      );
      const waitingTicketsViewId = await this.findViewIdByTitlePrefix(
        viewPrefixes.waitingTickets
      );
      const solvedTicketsViewId = await this.findViewIdByTitlePrefix(
        viewPrefixes.solvedTickets
      );

      // Check if we found all the views
      if (
        !newTicketsViewId ||
        !openTicketsViewId ||
        !waitingTicketsViewId ||
        !solvedTicketsViewId
      ) {
        console.warn(
          "Some required views were not found. Statistics may be incomplete."
        );
      }

      // Get tickets from each view (if found)
      console.log("Fetching tickets from views...");
      const newTicketsData = newTicketsViewId
        ? await this.getAllTicketsFromView(newTicketsViewId)
        : [];
      const openTicketsData = openTicketsViewId
        ? await this.getAllTicketsFromView(openTicketsViewId)
        : [];
      const waitingTicketsData = waitingTicketsViewId
        ? await this.getAllTicketsFromView(waitingTicketsViewId)
        : [];
      const solvedTicketsData = solvedTicketsViewId
        ? await this.getAllTicketsFromView(solvedTicketsViewId)
        : [];

      // Get metrics for calculating times
      console.log("Fetching ticket metrics...");
      const metricsResult = await this.getTicketMetrics(1, 100);
      const metrics = metricsResult.ticket_metrics || [];

      // Combine all tickets for total counts and other metrics
      const allTickets = [
        ...newTicketsData,
        ...openTicketsData,
        ...waitingTicketsData,
        ...solvedTicketsData,
      ];

      console.log(
        `Retrieved tickets: New(${newTicketsData.length}), Open(${openTicketsData.length}), Waiting(${waitingTicketsData.length}), Solved(${solvedTicketsData.length})`
      );

      // Count tickets in waiting view by status
      const pendingCount = waitingTicketsData.filter(
        (t) => t.status === "pending"
      ).length;
      const holdCount = waitingTicketsData.filter(
        (t) => t.status === "hold"
      ).length;

      // Count tickets in solved view by status
      const solvedCount = solvedTicketsData.filter(
        (t) => t.status === "solved"
      ).length;
      const closedCount = solvedTicketsData.filter(
        (t) => t.status === "closed"
      ).length;

      // Log status distribution from combined tickets for debugging
      const statusCounts = this.countTicketsByStatus(allTickets);
      console.log("Combined ticket status distribution:", statusCounts);

      // Calculate statistics
      const stats: TicketStatistics = {
        total: allTickets.length,
        new: newTicketsData.length,
        open: openTicketsData.length,
        pending: pendingCount,
        hold: holdCount,
        solved: solvedCount,
        closed: closedCount,

        // Calculate average times
        avgResponseTime: this.calculateAvgTime(
          metrics,
          "reply_time_in_minutes"
        ),
        avgResolutionTime: this.calculateAvgTime(
          metrics,
          "full_resolution_time_in_minutes"
        ),

        // SLA compliance
        slaCompliance: this.calculateSlaCompliance(allTickets, metrics),

        // Count by channel
        byChannel: this.countByChannel(allTickets),

        // Count by priority
        byPriority: this.countByPriority(allTickets),

        // Monthly activity
        monthlyActivity: this.getMonthlyActivity(allTickets),
      };

      console.log("Calculated ticket statistics (view-based):", stats);
      return stats;
    } catch (error) {
      console.error("Error calculating ticket statistics:", error);
      throw error;
    }
  }

  /**
   * Get all available Zendesk views
   */
  async getAllViews(): Promise<any[]> {
    try {
      console.log("Fetching all Zendesk views...");

      const response = await axios.get(
        `${this.baseUrl}/views.json`,
        this.getRequestConfig()
      );

      console.log(`Found ${response.data.views.length} views`);
      return response.data.views;
    } catch (error) {
      console.error("Error fetching views:", error);
      throw error;
    }
  }

  /**
   * Get tickets from a specific view with proper pagination
   */
  async getAllTicketsFromView(viewId: string): Promise<ZendeskTicket[]> {
    let allTickets: ZendeskTicket[] = [];
    let page = 1;
    let hasMorePages = true;

    try {
      console.log(`Fetching all tickets from view ${viewId} with pagination`);

      while (hasMorePages) {
        const response = await axios.get(
          `${this.baseUrl}/views/${viewId}/tickets.json`,
          this.getRequestConfig({ page, per_page: 100 })
        );

        const tickets = response.data.tickets || [];
        allTickets = [...allTickets, ...tickets];

        console.log(`Fetched page ${page}, got ${tickets.length} tickets`);

        // Check if there are more pages
        if (!response.data.next_page) {
          hasMorePages = false;
        } else {
          page++;
        }
      }

      console.log(
        `Total tickets fetched from view ${viewId}: ${allTickets.length}`
      );
      return allTickets;
    } catch (error) {
      console.error(`Error fetching all tickets from view ${viewId}:`, error);
      throw error;
    }
  }

  // Helper method to count tickets by status for debugging
  private countTicketsByStatus(
    tickets: ZendeskTicket[]
  ): Record<string, number> {
    const statusCounts: Record<string, number> = {};

    tickets.forEach((ticket) => {
      const status = ticket.status || "unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return statusCounts;
  }

  // Helper methods for statistics
  private calculateAvgTime(metrics: any[], field: string): number {
    const validMetrics = metrics.filter(
      (m) => m[field] !== null && m[field] !== undefined
    );
    if (validMetrics.length === 0) return 0;

    const sum = validMetrics.reduce((acc, curr) => acc + curr[field], 0);
    return Math.round(sum / validMetrics.length);
  }

  private calculateSlaCompliance(tickets: any[], metrics: any[]): number {
    const resolvedTickets = tickets.filter(
      (t) => t.status === "solved" || t.status === "closed"
    );
    if (resolvedTickets.length === 0) return 0;

    // Simplified SLA calculation
    const targetResolutionTime = 24 * 60; // 24 hours in minutes
    const compliantTickets = metrics.filter(
      (m) =>
        m.full_resolution_time_in_minutes !== null &&
        m.full_resolution_time_in_minutes <= targetResolutionTime
    );

    return Math.round((compliantTickets.length / resolvedTickets.length) * 100);
  }

  private countByChannel(tickets: any[]): Record<string, number> {
    const channels: Record<string, number> = {
      email: 0,
      web_form: 0,
      phone: 0,
      chat: 0,
      api: 0,
      other: 0,
    };

    tickets.forEach((ticket) => {
      const channel = ticket.via?.channel || "other";
      if (channels[channel] !== undefined) {
        channels[channel]++;
      } else {
        channels.other++;
      }
    });

    return channels;
  }

  private countByPriority(tickets: any[]): Record<string, number> {
    const priorities: Record<string, number> = {
      low: 0,
      normal: 0,
      high: 0,
      urgent: 0,
    };

    tickets.forEach((ticket) => {
      const priority = ticket.priority || "normal";
      if (priorities[priority] !== undefined) {
        priorities[priority]++;
      } else {
        priorities.normal++;
      }
    });

    return priorities;
  }

  private getMonthlyActivity(tickets: any[]): Record<string, number> {
    const monthlyData: Record<string, number> = {};
    const now = new Date();
    const currentYear = now.getFullYear();

    // Initialize all months
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(currentYear, i, 1).toLocaleString("default", {
        month: "short",
      });
      monthlyData[monthName] = 0;
    }

    // Count tickets by month created
    tickets.forEach((ticket) => {
      const createdAt = new Date(ticket.created_at);
      // Only count tickets from current year
      if (createdAt.getFullYear() === currentYear) {
        const month = createdAt.toLocaleString("default", { month: "short" });
        monthlyData[month]++;
      }
    });

    return monthlyData;
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

// Export singleton instance
export default new ZendeskService();
