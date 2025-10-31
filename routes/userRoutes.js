import express from "express";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/uploadMiddleware.js";
import { updateRole } from "../controllers/userController.js";
import fs from "fs";

const router = express.Router();

router.put("/update-role", auth , updateRole);
// ✅ Nueva ruta para obtener el perfil del usuario autenticado
router.get("/profile", auth, (req, res) => {
  res.json(req.user);
});

// 📸 Subir foto de perfil
router.post("/upload-photo", auth, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "users",
      transformation: [{ width: 500, height: 500, crop: "thumb", gravity: "face" }],
    });

    // Actualizar el usuario autenticado
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { photo: result.secure_url },
      { new: true, select: "-password" }
    );

    // Eliminar archivo temporal
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    res.status(200).json({
      message: "Photo uploaded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Error uploading photo",
      error: error.message,
    });
  }
});

export default router;
