"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calls_service_1 = require("../services/calls.service");
const router = (0, express_1.Router)();
const callService = new calls_service_1.CallService();
// Get call center statistics - main endpoint used by frontend
router.get("/stats", async (req, res) => {
    try {
        const stats = await callService.getCallCenterStats();
        res.json(stats);
    }
    catch (error) {
        console.error("Error fetching call stats:", error);
        res.status(500).json({ error: "Failed to fetch call statistics" });
    }
});
// Refresh call data - manually trigger a refresh
router.post("/refresh", async (req, res) => {
    try {
        await callService.refreshCallData();
        res.json({ message: "Call data refreshed successfully" });
    }
    catch (error) {
        console.error("Error refreshing call data:", error);
        res.status(500).json({ error: "Failed to refresh call data" });
    }
});
// Zendesk webhook endpoint
router.post("/zendesk", async (req, res) => {
    try {
        // Verify webhook signature if needed
        const event = req.body;
        // Check if this is a new ticket in the Callcenter-Rapporter view
        if (event.ticket && event.ticket.group_id === "your-callcenter-group-id") {
            await callService.refreshCallData();
        }
        res.status(200).send("OK");
    }
    catch (error) {
        console.error("Webhook error:", error);
        res.status(500).send("Error processing webhook");
    }
});
// Optional: Get all calls
router.get("/", async (req, res) => {
    try {
        const calls = await callService.getAllCalls();
        res.json(calls);
    }
    catch (error) {
        console.error("Error fetching calls:", error);
        res.status(500).json({ error: "Failed to fetch calls" });
    }
});
exports.default = router;
