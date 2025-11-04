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

// 🧩 Configuración de Multer (para subir imágenes temporales)
const upload = multer({ dest: "uploads/" });

// 🟣 Verificar si el correo ya existe (para registro o edición)
router.get("/check-email", checkEmail);

// 🟢 Obtener perfil del usuario autenticado
router.get("/me", auth, getMe);

// 🟡 Actualizar datos del usuario (nombre, email, foto, etc.)
router.put("/:id", auth, upload.single("profileImage"), updateUser);

// 📸 Subir o actualizar foto de perfil
router.put("/me/photo", auth, upload.single("file"), updateProfilePhoto);

// 🟢 Cambiar rol del usuario (driver/passenger)
router.put("/role/change", auth, updateRole);

export default router;
