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

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // Trust proxy headers in production (e.g., for HTTPS)

  const limiter = rateLimit({
    max: 100, // Maximum number of requests per hour
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many requests from this IP, please try again in an hour",
  });
  app.use("/api", limiter);
} else {
  app.use(cors({ credentials: true, origin: `http://localhost:3001` }));
  app.use(morgan("dev"));
}

app.use(compression());
app.use(express.json());

// Session middleware
const MongoStore = require("connect-mongo");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Use your MongoDB URI
      collectionName: "sessions", // Optional: Name of the collection to store sessions
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      httpOnly: true,
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
