// src/routes/tickets.route.ts
import { Router } from "express";
import ticketsController from "../controllers/tickets.controller";

const router = Router();

// Test and debug endpoints
router.get("/test", (req, res) => {
  res.json({
    message: "Zendesk Tickets API is working!",
    timestamp: new Date().toISOString(),
  });
});
router.get("/debug", ticketsController.debugZendesk.bind(ticketsController));

// View-related endpoints
router.get("/views", ticketsController.getAllViews.bind(ticketsController));
router.get(
  "/views/:viewId/tickets",
  ticketsController.getTicketsFromView.bind(ticketsController)
);

// Statistics and reports
router.get(
  "/stats/summary",
  ticketsController.getTicketStatistics.bind(ticketsController)
);
router.get(
  "/reports",
  ticketsController.getCallCenterReports.bind(ticketsController)
);

// Ticket filtering endpoints
router.get(
  "/callcenter",
  ticketsController.getCallCenterTickets.bind(ticketsController)
);
router.get(
  "/status/:status",
  ticketsController.getTicketsByStatus.bind(ticketsController)
);

// Main ticket endpoints
router.get("/", ticketsController.getAllTickets.bind(ticketsController));

// IMPORTANT: Keep this last to avoid route conflicts
router.get("/:id", ticketsController.getTicketById.bind(ticketsController));

export default router;
