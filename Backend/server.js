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
    const PORT = process.env.PORT || 8080; 
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on port ${PORT}`);
    });
    
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
