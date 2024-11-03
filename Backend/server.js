const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files from 'public'
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
// Verify JWT secret is loaded

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB is connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Import and use routes
const userRoutes = require("./Routes/UserRoutes");
app.use("/api/users", userRoutes);

const donationRoutes = require("./Routes/DonationRoutes");
app.use("/api/donations", donationRoutes);

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is connected!" });
});

if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(path.join(__dirname, "../food_donation_frontend/build"))
  );
  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "../food_donation_frontend/build", "index.html")
    );
  });
}
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://foodshare-connect-ae4125b0ab0a.herokuapp.com"
        : "http://localhost:3000",
    credentials: true,
  })
);
// In server.js
if (process.env.NODE_ENV === 'production') {
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
}
// In Backend/server.js
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message 
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
