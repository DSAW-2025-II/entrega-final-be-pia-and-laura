// routes/upload.routes.js
import express from "express";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/uploadMiddleware.js"; 
import { uploadPhoto } from "../controllers/uploadController.js";
const router = express.Router();

// 📤 Ruta para subir una imagen
router.post("/", upload.single("file"), uploadPhoto, auth);

export default router;