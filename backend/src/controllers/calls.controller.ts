import { Request, Response } from "express";
import { CallService } from "../services/calls.service";

export class CallController {
  private callService: CallService;

  constructor() {
    this.callService = new CallService();
  }

  getCallCenterStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.callService.getCallCenterStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch call center stats" });
    }
  };

  refreshCallData = async (req: Request, res: Response) => {
    try {
      await this.callService.refreshCallData();
      res.json({ message: "Call data refreshed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh call data" });
    }
  };
}
