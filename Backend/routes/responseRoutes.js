const express = require("express");
const responseController = require("../controllers/responseController");
const authMiddleware = require("../middleware/auth");
const responseRouter = express.Router();

responseRouter.get("/", authMiddleware, responseController.getAllResponses);

responseRouter.post("/", authMiddleware, responseController.createResponse);

responseRouter.patch("/modifyResponse/:response_id", responseController.updateResponse);

responseRouter.get("/:response_id", authMiddleware, responseController.getOneResponse);

responseRouter.delete("/:response_id", responseController.deleteResponse);

module.exports = responseRouter;
