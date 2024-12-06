require("dotenv").config({ override: true });
const mongoose = require("mongoose");
const app = require("./app");

// Use the PORT provided by Cloud Run, or default to 8080 locally
const PORT = process.env.PORTS || 8080;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database:", mongoose.connection.name);

    // Start the Express server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1); // Exit if database connection fails
  });
