// src/services/tickets.service.ts
import axios from "axios";
import {
  Ticket,
  SLAStats,
  TicketsStatsData,
  TicketView,
} from "../types/tickets.types";

const API_BASE_URL = "http://localhost:3000/api";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const ticketsService = {
  // Get all available views
  async getViews(): Promise<TicketView[]> {
    try {
      const response = await apiClient.get("/tickets/views");

      // Transform API data to match frontend TicketView interface
      return response.data.views.map((view: any) => ({
        id: view.id.toString(),
        name: view.title,
        count: 0, // Default count, will be updated when fetching tickets
        type: view.title.includes("::")
          ? view.title.split("::")[0].trim()
          : "Standard",
        active: view.active,
      }));
    } catch (error) {
      console.error("Error fetching views:", error);
      throw error;
    }
  },

  // Get tickets from a specific view
  async getTicketsFromView(
    viewId: string,
    page = 1,
    perPage = 100
  ): Promise<{ tickets: Ticket[]; count: number }> {
    try {
      const response = await apiClient.get(`/tickets/views/${viewId}/tickets`, {
        params: { page, per_page: perPage },
      });

      // Transform API data to match frontend Ticket interface
      const tickets = response.data.tickets.map(
        (apiTicket: any): Ticket => ({
          id: `#${apiTicket.id}`,
          subject: apiTicket.subject,
          status: apiTicket.status || "Ny",
          priority: apiTicket.priority || "Normal",
          updated: formatDate(apiTicket.created_at),
          anmoder: `requester-${apiTicket.requester_id}@example.com`, // Use requester_id if available
          anmoderName: `Requester ${apiTicket.requester_id}`, // Use requester_id if available
          database: "Support", // This data might need to come from another source
          response: calculateSLATime(apiTicket.created_at),
          group: apiTicket.group_id ? `Group ${apiTicket.group_id}` : "Support",
          assignee: apiTicket.assignee_id
            ? `Agent ${apiTicket.assignee_id}`
            : "",
        })
      );

      return {
        tickets,
        count: response.data.count || 0,
      };
    } catch (error) {
      console.error(`Error fetching tickets from view ${viewId}:`, error);
      throw error;
    }
  },

  // Get ticket stats - now using view-based approach
  async getTicketStats(): Promise<TicketsStatsData> {
    try {
      const response = await apiClient.get("/tickets/stats/summary");
      const stats = response.data.statistics;

      // Transform API data to match frontend expected format
      return {
        totalTickets: stats.total || 0,
        totalTicketsChange: 0, // Initialize to 0, would need historical API to calculate real change
        ticketsOpen: stats.open || 0,
        ticketsOpenChange: 0, // Initialize to 0, would need historical API to calculate real change
        ticketsWaiting: (stats.pending || 0) + (stats.hold || 0), // Combine pending and hold
        ticketsWaitingChange: 0, // Initialize to 0, would need historical API to calculate real change
        avgResolutionTime: stats.avgResolutionTime || 0,
        avgResolutionTimeChange: 0, // Initialize to 0, would need historical API to calculate real change
      };
    } catch (error) {
      console.error("Error fetching ticket stats:", error);
      throw error;
    }
  },

  // Get all tickets - this can still be used for backward compatibility
  async getAllTickets(
    page = 1,
    perPage = 100
  ): Promise<{ tickets: Ticket[]; count: number }> {
    try {
      const response = await apiClient.get("/tickets", {
        params: { page, per_page: perPage },
      });

      // Transform API data to match frontend Ticket interface
      const tickets = response.data.tickets.map(
        (apiTicket: any): Ticket => ({
          id: `#${apiTicket.id}`,
          subject: apiTicket.subject,
          status: apiTicket.status || "Ny",
          priority: apiTicket.priority || "Normal",
          updated: formatDate(apiTicket.created_at),
          anmoder: `requester-${apiTicket.requester_id}@example.com`,
          anmoderName: `Requester ${apiTicket.requester_id}`,
          database: "Support",
          response: calculateSLATime(apiTicket.created_at),
          group: apiTicket.group_id ? `Group ${apiTicket.group_id}` : "Support",
          assignee: apiTicket.assignee_id
            ? `Agent ${apiTicket.assignee_id}`
            : "",
        })
      );

      return {
        tickets,
        count: response.data.count || 0,
      };
    } catch (error) {
      console.error("Error fetching all tickets:", error);
      throw error;
    }
  },

  // Get call center tickets - still useful for specific call center view
  async getCallCenterTickets(
    page = 1,
    perPage = 100
  ): Promise<{ tickets: Ticket[]; count: number }> {
    try {
      const response = await apiClient.get("/tickets/callcenter", {
        params: { page, per_page: perPage },
      });

      // Transform API data to match frontend Ticket interface
      const tickets = response.data.tickets.map(
        (apiTicket: any): Ticket => ({
          id: `#${apiTicket.id}`,
          subject: apiTicket.subject,
          status: apiTicket.status || "Ny",
          priority: apiTicket.priority || "Normal",
          updated: formatDate(apiTicket.created_at),
          anmoder: `requester-${apiTicket.requester_id}@example.com`,
          anmoderName: `Requester ${apiTicket.requester_id}`,
          database: "Support",
          response: calculateSLATime(apiTicket.created_at),
          group: apiTicket.group_id ? `Group ${apiTicket.group_id}` : "Support",
          assignee: apiTicket.assignee_id
            ? `Agent ${apiTicket.assignee_id}`
            : "",
        })
      );

      return {
        tickets,
        count: response.data.count || 0,
      };
    } catch (error) {
      console.error("Error fetching call center tickets:", error);
      throw error;
    }
  },

  // Get call center reports
  async getCallCenterReports(): Promise<any[]> {
    try {
      const response = await apiClient.get("/tickets/reports");
      return response.data.reports || [];
    } catch (error) {
      console.error("Error fetching call center reports:", error);
      throw error;
    }
  },

  // Get SLA stats (derived from ticket stats)
  async getSLAStats(): Promise<SLAStats> {
    try {
      const response = await apiClient.get("/tickets/stats/summary");
      const stats = response.data.statistics;

      return {
        averageResponseTime: `${stats.avgResponseTime || 0} min`,
        responseTimeChange: 0, // Initialize to 0, would need historical API
        slaCompliance: stats.slaCompliance || 0,
        slaComplianceChange: 0, // Initialize to 0, would need historical API
        nearSLALimit: 0, // Would need API that provides this data
        overSLA: 0, // Would need API that provides this data
      };
    } catch (error) {
      console.error("Error fetching SLA stats:", error);
      throw error;
    }
  },
};

// Helper functions
function formatDate(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `For ${diffMinutes} minutter siden`;
    }
    return `I dag ${date.getHours()}:${String(date.getMinutes()).padStart(
      2,
      "0"
    )}`;
  } else if (diffDays === 1) {
    return "I går";
  } else {
    return `${date.getDate()}. ${getMonthShortName(date)}`;
  }
}

function getMonthShortName(date: Date): string {
  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "maj",
    "jun",
    "jul",
    "aug",
    "sep",
    "okt",
    "nov",
    "dec",
  ];
  return months[date.getMonth()];
}

function calculateSLATime(dateString: string): string {
  if (!dateString) return "";

  const createdDate = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 24) {
    return `${diffHours}t`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  }
}

export default ticketsService;
