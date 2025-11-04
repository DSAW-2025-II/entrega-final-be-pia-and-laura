import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { registerCar, updateCar } from "../controllers/carController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// 🔧 Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🎞️ Multer + Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "wheels-project",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    public_id: Date.now() + "-" + file.originalname.split(" ").join("_"),
    resource_type: file.mimetype === "application/pdf" ? "raw" : "image",
  }),
});

const upload = multer({ storage });

// 🚗 Registrar un nuevo carro
router.post(
  "/",
  auth,
  upload.fields([
    { name: "carPhoto", maxCount: 1 },
    { name: "soat", maxCount: 1 },
  ]),
  registerCar
);

// 🚙 Obtener el carro del usuario actual
router.get("/myCar", auth, updateCar);

// ✏️ Actualizar datos del carro existente
router.put(
  "/update",
  auth,
  upload.fields([
    { name: "carPhoto", maxCount: 1 },
    { name: "soat", maxCount: 1 },
  ]),
  updateCar
);

export default router;
