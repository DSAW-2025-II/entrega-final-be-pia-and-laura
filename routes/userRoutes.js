import express from "express";
import multer from "multer";
import {
  getMe,
  updateUser,
  updateRole,
  checkEmail,
  updateProfilePhoto,
} from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// 🧩 Configuración de Multer (en memoria, sin carpetas locales)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🟣 Verificar si el correo ya existe
router.get("/check-email", checkEmail);

// 🟢 Obtener perfil del usuario autenticado
router.get("/me", auth, getMe);

// 📸 Subir o actualizar foto de perfil
router.put("/me/photo", auth, upload.single("file"), updateProfilePhoto);

// 🟢 Cambiar rol del usuario (driver/passenger)
router.put("/role/change", auth, updateRole);

// 🟡 Actualizar datos del usuario (nombre, email, foto, etc.)
router.put("/:id", auth, upload.single("photo"), updateUser);

export default router;
