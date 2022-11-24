import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import questionRoute from "./routes/api/question.js";
import categoryRoute from "./routes/api/category.js";
import usersRoute from "./routes/api/users.js";
import authRoute from "./routes/api/auth.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// Init Middleware
app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log("DATABASE CONNECTED");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

connectDB();

// Define Routes
app.use("/api/question", questionRoute);
app.use("/api/category", categoryRoute);
app.use("/api/users", usersRoute);
app.use("/api/auth", authRoute);
