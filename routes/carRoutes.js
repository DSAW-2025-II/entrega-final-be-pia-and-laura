import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { registerCar } from "../controllers/carController.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();

// 🔧 Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🎞️ Configuración de Multer + Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "wheels-project", // carpeta en tu cuenta de Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    public_id: Date.now() + "-" + file.originalname.split(" ").join("_"),
    resource_type: file.mimetype === "application/pdf" ? "raw" : "image",
  }),
});

const upload = multer({ storage });

// 🚗 Ruta para registrar un auto
router.post(
  "/",
  upload.fields([
    { name: "carPhoto", maxCount: 1 },
    { name: "soat", maxCount: 1 },
  ]),
  registerCar
);
router.post("/register", auth, registerCar); // 🔒 Protegido por JWT

export default router;
