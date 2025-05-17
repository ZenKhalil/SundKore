"use strict";
// src/routes/tickets.route.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tickets_controller_1 = __importDefault(require("../controllers/tickets.controller"));
const router = (0, express_1.Router)();
// Route to test the API (add this simple test route)
router.get("/test", (req, res) => {
    res.json({
        message: "Zendesk Tickets API is working!",
        timestamp: new Date().toISOString(),
    });
});
// IMPORTANT: Specific routes need to come BEFORE the /:id route
// to prevent path conflicts
// Statistics route
router.get("/stats/summary", tickets_controller_1.default.getTicketStatistics.bind(tickets_controller_1.default));
// Reports routes
router.get("/reports", tickets_controller_1.default.getCallCenterReports.bind(tickets_controller_1.default));
router.get("/reports/:fileName/download", tickets_controller_1.default.downloadCallCenterReport.bind(tickets_controller_1.default));
// Call center tickets route
router.get("/callcenter", tickets_controller_1.default.getCallCenterTickets.bind(tickets_controller_1.default));
// Get all tickets
router.get("/", tickets_controller_1.default.getAllTickets.bind(tickets_controller_1.default));
// IMPORTANT: This generic route must be LAST, otherwise it will match other routes
router.get("/:id", tickets_controller_1.default.getTicketById.bind(tickets_controller_1.default));
exports.default = router;
