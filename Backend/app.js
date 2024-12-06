require("dotenv").config({ override: true });
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const examRouter = require("./routes/examRoutes");
const questionRouter = require("./routes/questionRoutes");
const responseRouter = require("./routes/responseRoutes");
const userRouter = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");
const gcsRouter = require("./routes/gcsRoutes");
const submitRouter = require("./routes/aiRoutes");

const app = express();

// Security and compression
app.use(helmet());
app.use(compression());

// Logging and CORS
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour",
  });
  app.use("/api", limiter);
} else {
  app.use(cors({ credentials: true, origin: `http://localhost:3001` }));
  app.use(morgan("dev"));
}

app.use(express.json());

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
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
