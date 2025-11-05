// routes/upload.routes.js
import express from "express";
import upload from "../middleware/uploadMiddleware.js"; 
import { uploadPhoto } from "../controllers/uploadController.js";
const router = express.Router();

// 📤 Ruta para subir una imagen
router.post("/", upload.single("file"), uploadPhoto);

export default router;