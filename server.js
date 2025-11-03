import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import path from "path";
import userRoutes from "./routes/userRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";


dotenv.config();
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://wheels-project.vercel.app", // ✅ producción
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
app.use("/uploads", express.static("uploads"));

connectDB();
app.use("/api/v1/reservations", reservationRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/car", carRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/", (req, res) => {
  res.send("Servidor funcionando con MongoDB");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
console.log("Cloudinary:", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY);
