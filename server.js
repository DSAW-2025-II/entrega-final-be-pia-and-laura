import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import path from "path";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); 

// Conectar a MongoDB
connectDB();

// Rutas
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/cars", carRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/", (req, res) => {
  res.send("Servidor funcionando con MongoDB");
});

// Iniciar servidor (solo una vez)
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
