require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = require("./app");

// Use the PORT provided by Cloud Run or default to 8080 for local testing
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to database:", mongoose.connection.name);

    // Start the Express server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1); // Exit if database connection fails
  });
