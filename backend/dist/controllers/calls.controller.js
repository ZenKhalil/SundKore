"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallController = void 0;
const calls_service_1 = require("../services/calls.service");
class CallController {
    constructor() {
        this.getCallCenterStats = async (req, res) => {
            try {
                const stats = await this.callService.getCallCenterStats();
                res.json(stats);
            }
            catch (error) {
                res.status(500).json({ error: "Failed to fetch call center stats" });
            }
        };
        this.refreshCallData = async (req, res) => {
            try {
                await this.callService.refreshCallData();
                res.json({ message: "Call data refreshed successfully" });
            }
            catch (error) {
                res.status(500).json({ error: "Failed to refresh call data" });
            }
        };
        this.callService = new calls_service_1.CallService();
    }
}
exports.CallController = CallController;
