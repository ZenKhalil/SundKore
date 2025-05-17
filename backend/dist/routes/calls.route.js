"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const calls_controller_1 = require("../controllers/calls.controller");
const router = (0, express_1.Router)();
const callController = new calls_controller_1.CallController();
router.get("/stats", callController.getCallCenterStats);
router.post("/refresh", callController.refreshCallData);
exports.default = router;
