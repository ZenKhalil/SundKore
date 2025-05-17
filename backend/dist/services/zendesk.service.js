"use strict";
// src/services/zendesk.service.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZendeskService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
class ZendeskService {
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
            throw new Error("Missing Zendesk configuration. Please check your .env file.");
        }
    }
    getAuthHeader() {
        return `Basic ${Buffer.from(`${this.email}/token:${this.apiToken}`).toString("base64")}`;
    }
    getRequestConfig(params = {}) {
        return {
            headers: {
                Authorization: this.getAuthHeader(),
                "Content-Type": "application/json",
            },
            params,
        };
    }
    /**
     * Get tickets from a specific Zendesk view
     */
    async getTicketsFromView(viewId = this.callCenterViewId, daysBack, page = 1, perPage = 100) {
        try {
            console.log(`Fetching tickets from view: ${viewId}, page ${page}`);
            const response = await axios_1.default.get(`${this.baseUrl}/views/${viewId}/tickets.json`, this.getRequestConfig({ page, per_page: perPage }));
            // Only filter tickets by creation date if daysBack is provided
            if (daysBack !== undefined) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - daysBack);
                const filteredTickets = response.data.tickets.filter((ticket) => {
                    const ticketDate = new Date(ticket.created_at);
                    return ticketDate >= cutoffDate;
                });
                console.log(`Found ${filteredTickets.length} tickets (filtered by date)`);
                return filteredTickets;
            }
            console.log(`Found ${response.data.tickets.length} tickets`);
            return response.data.tickets;
        }
        catch (error) {
            console.error("Error fetching tickets from view:", error);
            throw error;
        }
    }
    /**
     * Get call center tickets from the configured view
     */
    async getCallCenterTickets(page = 1, perPage = 100) {
        try {
            // Validate necessary configuration
            if (!this.subdomain || !this.email || !this.apiToken) {
                return {
                    tickets: [],
                    count: 0,
                    next_page: null,
                    prev_page: null,
                    error: "Zendesk API is not configured. Check server environment variables.",
                };
            }
            // Validate call center view ID
            if (!this.callCenterViewId) {
                return {
                    tickets: [],
                    count: 0,
                    next_page: null,
                    prev_page: null,
                    error: "Call center view ID is not configured. Check ZENDESK_CALLCENTER_VIEW_ID environment variable.",
                };
            }
            // Make the API call
            console.log(`Fetching call center tickets from view ${this.callCenterViewId}, page ${page}`);
            const response = await axios_1.default.get(`${this.baseUrl}/views/${this.callCenterViewId}/tickets.json`, this.getRequestConfig({ page, per_page: perPage }));
            return {
                tickets: response.data.tickets || [],
                count: response.data.count || 0,
                next_page: response.data.next_page,
                prev_page: response.data.previous_page,
            };
        }
        catch (error) {
            console.error("Error fetching call center tickets:", error);
            // Check for specific error types
            if (error.response) {
                // The request was made and the server responded with a status code outside of 2xx
                console.error(`Zendesk API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
                if (error.response.status === 401) {
                    return {
                        tickets: [],
                        count: 0,
                        next_page: null,
                        prev_page: null,
                        error: "Authentication failed. Please check your Zendesk credentials.",
                    };
                }
                else if (error.response.status === 404) {
                    return {
                        tickets: [],
                        count: 0,
                        next_page: null,
                        prev_page: null,
                        error: `View ID ${this.callCenterViewId} not found. Please check your ZENDESK_CALLCENTER_VIEW_ID.`,
                    };
                }
                else if (error.response.status === 429) {
                    return {
                        tickets: [],
                        count: 0,
                        next_page: null,
                        prev_page: null,
                        error: "Rate limit exceeded. Please try again later.",
                    };
                }
            }
            else if (error.request) {
                // The request was made but no response was received
                console.error("No response received from Zendesk API:", error.request);
                return {
                    tickets: [],
                    count: 0,
                    next_page: null,
                    prev_page: null,
                    error: "No response received from Zendesk API. Please check your network connection.",
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
    async getTickets(page = 1, perPage = 100) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/tickets.json`, this.getRequestConfig({
                page,
                per_page: perPage,
                include: "users,groups",
            }));
            return {
                tickets: response.data.tickets,
                count: response.data.count,
                next_page: response.data.next_page,
                prev_page: response.data.previous_page,
            };
        }
        catch (error) {
            console.error("Error fetching tickets:", error);
            throw error;
        }
    }
    /**
     * Get a ticket by ID
     */
    async getTicketById(id) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/tickets/${id}.json`, this.getRequestConfig());
            return {
                ticket: response.data.ticket,
            };
        }
        catch (error) {
            console.error(`Error fetching ticket ${id}:`, error);
            throw error;
        }
    }
    /**
     * Get ticket comments
     */
    async getTicketComments(ticketId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/tickets/${ticketId}/comments.json`, this.getRequestConfig());
            return response.data.comments;
        }
        catch (error) {
            console.error("Error fetching ticket comments:", error);
            throw error;
        }
    }
    /**
     * Get ticket metrics
     */
    async getTicketMetrics(page = 1, perPage = 100) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/ticket_metrics.json`, this.getRequestConfig({ page, per_page: perPage }));
            return {
                ticket_metrics: response.data.ticket_metrics,
                count: response.data.count,
                next_page: response.data.next_page,
                prev_page: response.data.previous_page,
            };
        }
        catch (error) {
            console.error("Error fetching ticket metrics:", error);
            throw error;
        }
    }
    /**
     * Get all available views
     */
    async getViews() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/views.json`, this.getRequestConfig());
            return {
                views: response.data.views,
                count: response.data.count,
                next_page: response.data.next_page,
                prev_page: response.data.previous_page,
            };
        }
        catch (error) {
            console.error("Error fetching views:", error);
            throw error;
        }
    }
    /**
     * Download attachment
     */
    async downloadAttachment(attachmentUrl) {
        try {
            const response = await axios_1.default.get(attachmentUrl, {
                headers: {
                    Authorization: this.getAuthHeader(),
                },
                responseType: "arraybuffer",
            });
            return Buffer.from(response.data);
        }
        catch (error) {
            console.error("Error downloading attachment:", error);
            throw error;
        }
    }
    /**
     * Get call center reports
     */
    async getCallCenterReports(daysBack) {
        try {
            console.log(`Fetching call center reports${daysBack !== undefined ? ` (last ${daysBack} days)` : " (all time)"}`);
            const tickets = await this.getTicketsFromView(this.callCenterViewId, daysBack);
            console.log(`Found ${tickets.length} tickets in view`);
            const reports = [];
            // Only create cutoff date if daysBack is provided
            let cutoffDate = null;
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
                            console.log(`    Checking attachment: ${attachment.file_name} (${attachment.content_type})`);
                            // Updated condition to handle application/octet-stream
                            if ((attachment.content_type === "application/pdf" ||
                                attachment.content_type === "application/octet-stream") &&
                                attachment.file_name.match(/callCenterReport_\d{6}_[\w-]+\.pdf/i)) {
                                const reportDate = this.extractDateFromFilename(attachment.file_name);
                                // Only filter by date if cutoffDate exists
                                if (!cutoffDate || reportDate >= cutoffDate) {
                                    console.log(`    ✓ Matched call center report: ${attachment.file_name} (Date: ${reportDate.toISOString()})`);
                                    const pdfBuffer = await this.downloadAttachment(attachment.content_url);
                                    reports.push({
                                        ticket,
                                        pdfBuffer,
                                        fileName: attachment.file_name,
                                        reportDate: reportDate,
                                    });
                                }
                                else {
                                    console.log(`    ⚠ Skipping old report: ${attachment.file_name} (Date: ${reportDate.toISOString()})`);
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
            const reportsByDate = new Map();
            reports.forEach((report) => {
                const dateKey = report.reportDate.toISOString().split("T")[0]; // YYYY-MM-DD
                if (!reportsByDate.has(dateKey)) {
                    reportsByDate.set(dateKey, []);
                }
                reportsByDate.get(dateKey).push(report);
            });
            // If there are multiple reports for the same date, keep only the newest
            const uniqueReports = [];
            reportsByDate.forEach((reportsForDate, dateKey) => {
                if (reportsForDate.length > 1) {
                    console.log(`⚠ Found ${reportsForDate.length} reports for ${dateKey}, keeping only the newest`);
                    // Sort by filename (which includes timestamp) and take the newest
                    reportsForDate.sort((a, b) => b.fileName.localeCompare(a.fileName));
                    uniqueReports.push(reportsForDate[0]);
                }
                else {
                    uniqueReports.push(reportsForDate[0]);
                }
            });
            // Final sort by date (newest first)
            uniqueReports.sort((a, b) => b.reportDate.getTime() - a.reportDate.getTime());
            console.log(`Final report count after deduplication: ${uniqueReports.length}`);
            return uniqueReports;
        }
        catch (error) {
            console.error("Error getting call center reports:", error);
            throw error;
        }
    }
    /**
     * Calculate ticket statistics
     */
    async getTicketStatistics() {
        try {
            // Get tickets and metrics
            const ticketsResult = await this.getTickets(1, 100);
            const metricsResult = await this.getTicketMetrics(1, 100);
            const tickets = ticketsResult.tickets;
            const metrics = metricsResult.ticket_metrics;
            // Calculate statistics
            const stats = {
                total: tickets.length,
                open: tickets.filter((t) => t.status === "open").length,
                closed: tickets.filter((t) => t.status === "closed")
                    .length,
                pending: tickets.filter((t) => t.status === "pending")
                    .length,
                solved: tickets.filter((t) => t.status === "solved")
                    .length,
                // Calculate average times
                avgResponseTime: this.calculateAvgTime(metrics, "reply_time_in_minutes"),
                avgResolutionTime: this.calculateAvgTime(metrics, "full_resolution_time_in_minutes"),
                // SLA compliance
                slaCompliance: this.calculateSlaCompliance(tickets, metrics),
                // Count by channel
                byChannel: this.countByChannel(tickets),
                // Count by priority
                byPriority: this.countByPriority(tickets),
                // Monthly activity
                monthlyActivity: this.getMonthlyActivity(tickets),
            };
            return stats;
        }
        catch (error) {
            console.error("Error calculating ticket statistics:", error);
            throw error;
        }
    }
    // Helper methods for statistics
    calculateAvgTime(metrics, field) {
        const validMetrics = metrics.filter((m) => m[field] !== null && m[field] !== undefined);
        if (validMetrics.length === 0)
            return 0;
        const sum = validMetrics.reduce((acc, curr) => acc + curr[field], 0);
        return Math.round(sum / validMetrics.length);
    }
    calculateSlaCompliance(tickets, metrics) {
        const resolvedTickets = tickets.filter((t) => t.status === "solved" || t.status === "closed");
        if (resolvedTickets.length === 0)
            return 0;
        // Simplified SLA calculation
        const targetResolutionTime = 24 * 60; // 24 hours in minutes
        const compliantTickets = metrics.filter((m) => m.full_resolution_time_in_minutes !== null &&
            m.full_resolution_time_in_minutes <= targetResolutionTime);
        return Math.round((compliantTickets.length / resolvedTickets.length) * 100);
    }
    countByChannel(tickets) {
        const channels = {
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
            }
            else {
                channels.other++;
            }
        });
        return channels;
    }
    countByPriority(tickets) {
        const priorities = {
            low: 0,
            normal: 0,
            high: 0,
            urgent: 0,
        };
        tickets.forEach((ticket) => {
            const priority = ticket.priority || "normal";
            if (priorities[priority] !== undefined) {
                priorities[priority]++;
            }
            else {
                priorities.normal++;
            }
        });
        return priorities;
    }
    getMonthlyActivity(tickets) {
        const monthlyData = {};
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
    extractDateFromFilename(filename) {
        // Extract YYMMDD and HHMMSS from filename like callCenterReport_250509_182914.pdf
        const match = filename.match(/callCenterReport_(\d{2})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.pdf/);
        if (match) {
            const [, year, month, day, hour, minute, second] = match;
            // Assuming 20xx for the year
            return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
        }
        // Fallback to date-only parsing if full timestamp not available
        const dateMatch = filename.match(/callCenterReport_(\d{2})(\d{2})(\d{2})_/);
        if (dateMatch) {
            const [, year, month, day] = dateMatch;
            return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        console.warn(`Unable to extract date from filename: ${filename}`);
        return new Date();
    }
}
exports.ZendeskService = ZendeskService;
// Export singleton instance
exports.default = new ZendeskService();
