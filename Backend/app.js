require("dotenv").config({ override: true });
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const passport = require("passport");
const session = require("express-session");
const examRouter = require("./routes/examRoutes");
const questionRouter = require("./routes/questionRoutes");
const responseRouter = require("./routes/responseRoutes");
const userRouter = require("./routes/userRoutes");
const audioRouter = require("./routes/audioTranscriptionRoutes");
const authRouter = require("./routes/authRoutes");
// const uploadRouter = require("./routes/gcsRoutes");
const submitRouter = require("./routes/aiRoutes");
const gcsRouter = require("./routes/gcsRoutes");

// express app
const app = express();

// middlewares
app.use(helmet());

if (process.env.NODE_ENV !== "deployment") {
  app.use(morgan("dev"));
  app.use(cors({ credentials: true, origin: `localhost:3001` }));
} else {
  app.use(cors({ credentials: true, origin: `https://frontend-839795182838.us-central1.run.app` }));
  const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour",
  });
  app.use("/api", limiter);
}
app.use(compression());
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "deployment", // Use secure cookies in production
      // httpOnly: true,
      sameSite: "none", // Required for cross-domain cookies
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require("./controllers/authController")(passport);

app.use("/api/v1/exams", examRouter);
app.use("/api/v1/questions", questionRouter);
app.use("/api/v1/responses", responseRouter);
app.use("/api/v1/users", userRouter);
// app.use("/api/v1/uploads", audioRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/upload", gcsRouter);
app.use("/api/v1/submit", submitRouter);
module.exports = app;
