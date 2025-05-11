import { Router } from "express";
import { CallController } from "../controllers/calls.controller";

const router = Router();
const callController = new CallController();

router.get("/stats", callController.getCallCenterStats);
router.post("/refresh", callController.refreshCallData);

export default router;
