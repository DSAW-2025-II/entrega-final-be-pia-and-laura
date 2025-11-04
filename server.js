import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";

import authRoutes from "./routes/authRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import uploadRoutes from "./routes/uploadRotes.js";

dotenv.config();
const app = express();

// 🌐 Configuración de CORS
const allowedOrigins = [
  "http://localhost:5173", // desarrollo
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

// ✅ Permitir preflight requests (con misma config)
app.use(cors());

// Middleware base
app.use(express.json());

// 🧠 Conexión a la base de datos
connectDB();

// 📦 Prefijo común para la API
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/car", carRoutes);
app.use("/api/v1/reservations", reservationRoutes);
app.use("/api/v1/upload", uploadRoutes);

// 🌍 Ruta base
app.get("/", (req, res) => {
  res.send("🚀 Servidor funcionando con MongoDB y listo para recibir peticiones");
});

export default app;
