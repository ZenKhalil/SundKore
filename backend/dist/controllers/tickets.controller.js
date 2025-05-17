"use strict";
// src/controllers/tickets.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsController = void 0;
const zendesk_service_1 = __importDefault(require("../services/zendesk.service"));
class TicketsController {
    /**
     * Get tickets from the default call center view
     */
    async getCallCenterTickets(req, res) {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;
            const perPage = req.query.per_page ? Number(req.query.per_page) : 100;
            const data = await zendesk_service_1.default.getCallCenterTickets(page, perPage);
            // Check if the service returned an error
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
                tickets: data.tickets,
                count: data.count,
                nextPage: data.next_page ? page + 1 : undefined,
                prevPage: page > 1 ? page - 1 : undefined,
            });
        }
        catch (error) {
            console.error("Error getting call center tickets:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch call center tickets",
                error: error.message,
            });
        }
    }
    /**
     * Get all tickets
     */
    async getAllTickets(req, res) {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;
            const perPage = req.query.per_page ? Number(req.query.per_page) : 100;
            const data = await zendesk_service_1.default.getTickets(page, perPage);
            return res.status(200).json({
                success: true,
                tickets: data.tickets,
                count: data.count,
                nextPage: data.next_page ? page + 1 : undefined,
                prevPage: page > 1 ? page - 1 : undefined,
            });
        }
        catch (error) {
            console.error("Error getting all tickets:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch tickets",
                error: error.message,
            });
        }
    }
    /**
     * Get ticket by ID
     */
    async getTicketById(req, res) {
        try {
            const { id } = req.params;
            const data = await zendesk_service_1.default.getTicketById(id);
            return res.status(200).json({
                success: true,
                ticket: data.ticket,
            });
        }
        catch (error) {
            console.error(`Error getting ticket ${req.params.id}:`, error);
            return res.status(500).json({
                success: false,
                message: `Failed to fetch ticket ${req.params.id}`,
                error: error.message,
            });
        }
    }
    /**
     * Get ticket statistics
     */
    async getTicketStatistics(req, res) {
        try {
            const stats = await zendesk_service_1.default.getTicketStatistics();
            return res.status(200).json({
                success: true,
                statistics: stats,
            });
        }
        catch (error) {
            console.error("Error getting ticket statistics:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch ticket statistics",
                error: error.message,
            });
        }
    }
    /**
     * Get call center reports
     */
    async getCallCenterReports(req, res) {
        try {
            const daysBack = req.query.days_back ? Number(req.query.days_back) : 30; // Default to 30 days
            // Use the getCallCenterReports method from your existing code
            // This should call the getTicketsFromView and then process them for PDF attachments
            const reports = await zendesk_service_1.default.getCallCenterReports(daysBack);
            // Don't send the full PDF buffers in the response
            const reportSummaries = reports.map((report) => ({
                ticketId: report.ticket.id,
                ticketSubject: report.ticket.subject,
                fileName: report.fileName,
                reportDate: report.reportDate,
                fileSize: report.pdfBuffer.length,
            }));
            return res.status(200).json({
                success: true,
                count: reports.length,
                reports: reportSummaries,
            });
        }
        catch (error) {
            console.error("Error getting call center reports:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch call center reports",
                error: error.message,
            });
        }
    }
    /**
     * Download a specific call center report
     */
    async downloadCallCenterReport(req, res) {
        try {
            const { fileName } = req.params;
            const daysBack = req.query.days_back ? Number(req.query.days_back) : 30;
            // Get reports from the last X days
            const reports = await zendesk_service_1.default.getCallCenterReports(daysBack);
            // Find the report with the requested filename
            const report = reports.find((r) => r.fileName === fileName);
            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: `Report ${fileName} not found`,
                });
            }
            // Set content headers and send the PDF buffer
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
            return res.send(report.pdfBuffer);
        }
        catch (error) {
            console.error(`Error downloading report:`, error);
            return res.status(500).json({
                success: false,
                message: "Failed to download report",
                error: error.message,
            });
        }
    }
}
exports.TicketsController = TicketsController;
exports.default = new TicketsController();
