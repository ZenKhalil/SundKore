// src/controllers/tickets.controller.ts
import { Request, Response } from "express";
import zendeskService from "../services/zendesk.service";

// Utility to pick only the fields we need for display
function slimTicket(ticket: any) {
  return {
    id: ticket.id,
    subject: ticket.subject,
    description: ticket.description || "",
    status: ticket.status || "new",
    priority: ticket.priority || "normal",
    created_at: ticket.created_at,
  };
}

export class TicketsController {
  /**
   * Get all Zendesk views
   */
  async getAllViews(req: Request, res: Response) {
    try {
      console.log("Fetching all Zendesk views");
      const views = await zendeskService.getAllViews();

      return res.status(200).json({
        success: true,
        count: views.length,
        views: views.map((view) => ({
          id: view.id,
          title: view.title,
          active: view.active,
          position: view.position,
          description: view.description,
          created_at: view.created_at,
          updated_at: view.updated_at,
        })),
      });
    } catch (err: any) {
      console.error("Error getting views:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch views",
        error: err.message,
      });
    }
  }

  /**
   * Get all tickets from a specific view
   */
  async getTicketsFromView(req: Request, res: Response) {
    try {
      const { viewId } = req.params;

      if (!viewId) {
        return res.status(400).json({
          success: false,
          message: "View ID is required",
        });
      }

      console.log(`Fetching tickets from view ID: ${viewId}`);
      const tickets = await zendeskService.getAllTicketsFromView(viewId);

      return res.status(200).json({
        success: true,
        count: tickets.length,
        tickets: tickets.map(slimTicket),
      });
    } catch (err: any) {
      console.error(
        `Error getting tickets from view ${req.params.viewId}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: `Failed to fetch tickets from view ${req.params.viewId}`,
        error: err.message,
      });
    }
  }

  /**
   * Get ticket statistics (now using view-based approach)
   */
  async getTicketStatistics(req: Request, res: Response) {
    try {
      console.log("Getting ticket statistics using view-based approach...");
      const statistics = await zendeskService.getTicketStatistics();

      return res.status(200).json({
        success: true,
        statistics,
      });
    } catch (err: any) {
      console.error("Error getting ticket statistics:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch ticket statistics",
        error: err.message,
      });
    }
  }

  /**
   * Get all tickets with pagination
   */
  async getAllTickets(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const perPage = Number(req.query.per_page) || 100;

      console.log(`Fetching all tickets (page ${page}, perPage ${perPage})`);
      const data = await zendeskService.getTickets(page, perPage);

      return res.status(200).json({
        success: true,
        tickets: (data.tickets || []).map(slimTicket),
        count: data.count,
        nextPage: data.next_page ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      });
    } catch (err: any) {
      console.error("Error getting all tickets:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch tickets",
        error: err.message,
      });
    }
  }

  /**
   * Get a single ticket by ID
   */
  async getTicketById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket ID provided",
        });
      }

      console.log(`Fetching ticket details for ID: ${id}`);
      const data = await zendeskService.getTicketById(id);

      if (!data || !data.ticket) {
        return res.status(404).json({
          success: false,
          message: `Ticket with ID ${id} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        ticket: data.ticket,
      });
    } catch (err: any) {
      // Handle not found error specifically
      if (err.response && err.response.status === 404) {
        return res.status(404).json({
          success: false,
          message: `Ticket ${req.params.id} not found`,
        });
      }

      console.error(`Error getting ticket ${req.params.id}:`, err);
      return res.status(500).json({
        success: false,
        message: `Failed to fetch ticket ${req.params.id}`,
        error: err.message,
      });
    }
  }

  /**
   * Get tickets by status (legacy method - consider using views instead)
   */
  async getTicketsByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const page = Number(req.query.page) || 1;
      const perPage = Number(req.query.per_page) || 100;

      if (
        !["new", "open", "pending", "hold", "solved", "closed"].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status provided. Must be one of: new, open, pending, hold, solved, closed",
        });
      }

      console.log(
        `Fetching tickets with status: ${status} (page ${page}, perPage ${perPage})`
      );
      const data = await zendeskService.getTicketsByStatus(
        status,
        page,
        perPage
      );

      return res.status(200).json({
        success: true,
        tickets: data.tickets.map(slimTicket),
        count: data.count,
        nextPage: data.next_page ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      });
    } catch (err: any) {
      console.error(
        `Error getting tickets with status ${req.params.status}:`,
        err
      );
      return res.status(500).json({
        success: false,
        message: `Failed to fetch tickets with status ${req.params.status}`,
        error: err.message,
      });
    }
  }

  /**
   * Get call center tickets
   */
  async getCallCenterTickets(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const perPage = Number(req.query.per_page) || 100;

      console.log(
        `Fetching call center tickets (page ${page}, perPage ${perPage})`
      );
      const data = await zendeskService.getCallCenterTickets(page, perPage);

      if (data.error) {
        return res.status(400).json({
          success: false,
          message: data.error,
          tickets: [],
          count: 0,
        });
      }

      return res.status(200).json({
        success: true,
        tickets: data.tickets.map(slimTicket),
        count: data.count,
        nextPage: data.next_page ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      });
    } catch (err: any) {
      console.error("Error getting call center tickets:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch call center tickets",
        error: err.message,
      });
    }
  }

  /**
   * Get call center reports metadata (no buffers)
   */
  async getCallCenterReports(req: Request, res: Response) {
    try {
      const daysBack = Number(req.query.days_back) || 30;
      console.log(`Fetching call center reports for the last ${daysBack} days`);

      const reports = await zendeskService.getCallCenterReports(daysBack);

      const summaries = reports.map((r) => ({
        ticketId: r.ticket.id,
        subject: r.ticket.subject,
        fileName: r.fileName,
        reportDate: r.reportDate,
        fileSize: r.pdfBuffer.length,
      }));

      return res.status(200).json({
        success: true,
        count: summaries.length,
        reports: summaries,
      });
    } catch (err: any) {
      console.error("Error getting call center reports:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch call center reports",
        error: err.message,
      });
    }
  }

  /**
   * Debug endpoint to check Zendesk config
   */
  async debugZendesk(req: Request, res: Response) {
    try {
      const config = {
        ZENDESK_SUBDOMAIN: process.env.ZENDESK_SUBDOMAIN
          ? "✓ Configured"
          : "✗ Missing",
        ZENDESK_EMAIL: process.env.ZENDESK_EMAIL ? "✓ Configured" : "✗ Missing",
        ZENDESK_API_TOKEN: process.env.ZENDESK_API_TOKEN
          ? "✓ Configured"
          : "✗ Missing",
        ZENDESK_CALLCENTER_VIEW_ID: process.env.ZENDESK_CALLCENTER_VIEW_ID
          ? "✓ Configured"
          : "✗ Missing",
        PORT: process.env.PORT || 3000,
      };

      return res.status(200).json({
        success: true,
        status: "Debug information",
        config,
        timestamp: new Date().toISOString(),
        serverInfo: { node: process.version, platform: process.platform },
      });
    } catch (err: any) {
      console.error("Error getting debug info:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to get debug information",
        error: err.message,
      });
    }
  }
}

export default new TicketsController();
