const express = require("express");
const audioController = require("../controllers/audioTranscriptionController");
const authMiddleware = require("../middleware/auth");
const audioRouter = express.Router();

audioRouter.post("/", authMiddleware, audioController.handleAudioUpload);

module.exports = audioRouter;
