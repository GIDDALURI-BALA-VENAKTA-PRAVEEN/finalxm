import Card from "./models/Card.js";
import adminRoute from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cardRoutes from "./routes/cardRoutes.js";
import cust from "./routes/customerdetails.js"
import { connectDB, sequelize } from "./config/db.js";
import cors from "cors";
import dotenv from 'dotenv';
import errorHandler from "./middleware/errorMiddleware.js";
import express from "express";
import imageRoutes from "./routes/imageRoutes.js";
import mongoose from "mongoose";
import path from "path";
import userRoutes from "./routes/userRoutes.js";
import payment from "./routes/payment.js"
import woohooRoutes from "./routes/woohooRoutes.js"

const app = express();
const PORT = 4000;
dotenv.config();
// Connect to MongoDB
connectDB();
//this will sync db and create tables
await sequelize.sync();
// Middlewares
app.use(cors());
app.use(express.json());

// Serve static images
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));

// Routes
app.use("/api/admin", adminRoute);
app.use("/api", imageRoutes);
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/cards", cardRoutes);

//payment
app.use('/api/payment', payment);
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).send("Internal Server Error!");
});


//for nginx
app.use('/admin/dashboard', (req, res) => {
  res.status(403).json({ message: 'Access Forbidden' });
});

//for card

app.get("/api/cards/:id", async (req, res) => {
  try {
    console.log(`API hit for card ID: ${req.params.id}`); // Debugging
    const card = await Card.findByPk(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//app.use("/api/cards", cardRoutes);

// Error Middleware
app.use(errorHandler);


//Woohoo fetching
app.use("/api/woohoo",woohooRoutes);

 

//login
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/cust/data",cust);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
