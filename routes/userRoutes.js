import express from "express";
import { auth } from "../middleware/auth.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  updateRole,
  getMe,
  updateUser,
  checkEmail,
  updateProfilePhoto,
} from "../controllers/userController.js";

const router = express.Router();

// 🟢 Cambiar rol del usuario
router.put("/update-role", auth, updateRole);

// 🟢 Obtener perfil autenticado
router.get("/me", auth, getMe);

// 🟣 Verificar si un correo ya está registrado
router.post("/check-email", checkEmail);

// 🟡 Actualizar datos del usuario (nombre, correo, id, teléfono)
router.put("/:id", auth, updateUser);

// 📸 Subir o actualizar foto de perfil
router.post("/upload-photo", auth, upload.single("photo"), updateProfilePhoto);

export default router;
