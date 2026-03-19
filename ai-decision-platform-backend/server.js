const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./server/config/db");

dotenv.config();

const app = express();

app.use(express.json());

// Connect database
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("Server running");
});

// Auth routes
const authRoute = require("./server/routes/authRoute");
app.use("/api/auth", authRoute);

// Protected route test
const authMiddleware = require("./server/middleware/authMiddleware");
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "This is a protected route", userId: req.user });
});

// Dataset routes
const datasetRoute = require("./server/routes/datasetRoute");
app.use("/api/dataset", datasetRoute);
app.use("/uploads", express.static("uploads"));

// Model routes
const modelRoute = require("./server/routes/modelRoute");
app.use("/api/models", modelRoute);

// Prediction routes
const predictionRoute = require("./server/routes/predictionRoute");
app.use("/api/predictions", predictionRoute);

// Simulation routes
const simulationRoute = require("./server/routes/simulationRoute");
app.use("/api/simulations", simulationRoute);

// Insights routes
const insightRoute = require("./server/routes/insightRoute");
app.use("/api/insights", insightRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});