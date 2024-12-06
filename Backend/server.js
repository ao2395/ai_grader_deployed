require("dotenv").config({ override: true });
const mongoose = require("mongoose");
const app = require("./app");

// Connect to the database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database:", mongoose.connection.name);

    // Start the server
    const PORT = process.env.PORT || 8080; // Use the Cloud Run PORT variable or default to 8080
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
