import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js"; // ensure filename matches

dotenv.config();
const app = express();

// 🌐 Configuración de CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://wheels-project.vercel.app", // producción
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ CORS bloqueado para:", origin);
        callback(new Error("No autorizado por CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Express + Vercel compatible
app.options(/.*/, cors());
app.use(express.json());

// 🧠 Conexión a la base de datos
connectDB();

// 📦 Rutas principales
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/car", carRoutes);
app.use("/reservations", reservationRoutes);
app.use("/upload", uploadRoutes); // <- mount upload under /api/v1/upload

// 🌍 Ruta base
app.get("/", (req, res) => {
  res.send("🚀 Servidor funcionando con MongoDB y listo para recibir peticiones");
});

export default app;