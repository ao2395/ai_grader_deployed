const express = require("express");
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/auth");
const questionRouter = express.Router();

questionRouter.get("/", authMiddleware, questionController.getAllQuestions);

questionRouter.post("/", questionController.createQuestion);

questionRouter.patch("/modifyQuestion/:question_id", questionController.updateQuestion);

questionRouter.get("/:question_id", authMiddleware, questionController.getOneQuestion);

questionRouter.delete("/:question_id", questionController.deleteQuestion);

module.exports = questionRouter;
