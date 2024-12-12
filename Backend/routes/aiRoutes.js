const express = require("express");
const aiController = require("../controllers/aiController");
const authMiddleware = require("../middleware/auth");

const aiRouter = express.Router();

// This route receives questionId and userId from the frontend
aiRouter.post("/question", authMiddleware, async (req, res) => {
  try {
    const { questionId, userId } = req.body;
    console.log("Received request with:", { questionId, userId });

    if (!questionId || !userId) {
      console.log("Missing questionId or userId");
      return res.status(400).json({ message: "Missing questionId or userId." });
    }

    const feedback = await aiController.processSubmission("ai-grader-storage", questionId, userId);
    console.log("Feedback received:", feedback);
    
    res.status(200).json(feedback);
  } catch (error) {
    console.error("Error processing submission:", error);
    res.status(500).json({ error: "An error occurred while processing the submission." });
  }
});

module.exports = aiRouter;
