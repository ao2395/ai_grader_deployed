require("dotenv").config({ override: true });
const mongoose = require("mongoose");
const app = require("./app");

// Connect to database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database:", mongoose.connection.name);

    const server = app.listen(process.env.PORT || 8080, () => {
      console.log(`Listening on port ${process.env.PORT || 8080}...`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("\nShutting down gracefully...");
      server.close(() => console.log("Server closed."));
      await mongoose.connection.close();
      console.log("Disconnected from database.");
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
