import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import path from "path";
import mongoose from "mongoose";



dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); 

connectDB();

// Rutas
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/cars", carRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));


app.get("/", (req, res) => {
  res.send("Servidor funcionando con MongoDB ");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
    app.listen(process.env.PORT || 4000, () => {
      console.log("🚀 Servidor corriendo en puerto 4000");
    });
  })
  .catch(err => console.error("❌ Error conectando a MongoDB:", err));