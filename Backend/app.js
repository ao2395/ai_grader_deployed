require("dotenv").config({ override: true });
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const passport = require("passport");

const examRouter = require("./routes/examRoutes");
const questionRouter = require("./routes/questionRoutes");
const responseRouter = require("./routes/responseRoutes");
const userRouter = require("./routes/userRoutes");
const audioRouter = require("./routes/audioTranscriptionRoutes");
const authRouter = require("./routes/authRoutes");
const submitRouter = require("./routes/aiRoutes");
const gcsRouter = require("./routes/gcsRoutes");

const app = express();
app.set("trust proxy", true);
// Middlewares
app.use(helmet());

if (process.env.NODE_ENV !== "deployment") {
  app.use(morgan("dev"));
  app.use(cors({ origin: `http://localhost:3001`, credentials: true }));
} else {
  app.use(cors({ origin: [process.env.FRONTEND_URL, `https://drawexplain.com`], credentials: true }));
  const limiter = rateLimit({
    max: 200,
    windowMs: 3 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour",
  });
  app.use("/api", limiter);
}

app.use(compression());
app.use(express.json());

// Passport middleware
app.use(passport.initialize());
require("./controllers/authController")(passport);

// Routes
app.use("/api/v1/exams", examRouter);
app.use("/api/v1/questions", questionRouter);
app.use("/api/v1/responses", responseRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/upload", gcsRouter);
app.use("/api/v1/submit", submitRouter);

module.exports = app;
