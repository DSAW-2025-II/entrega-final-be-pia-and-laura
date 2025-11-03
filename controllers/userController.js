// controllers/userController.js
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// 🟢 Cambiar el rol del usuario autenticado
export const updateRole = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newRole } = req.body;

    const validRoles = ["passenger", "driver"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: "Rol no válido" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true, select: "-password" }
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: `Rol actualizado a ${newRole} correctamente.`,
      user,
    });
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    res.status(500).json({ message: "Error al actualizar rol" });
  }
};

// 🟣 Verificar si un correo ya existe (para registro)
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(200).json({
        exists: true,
        message: "El correo ya está registrado",
      });
    } else {
      return res.status(200).json({
        exists: false,
        message: "Correo disponible",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al verificar el correo" });
  }
};

// 🟢 Obtener perfil del usuario autenticado
export const getMe = async (req, res) => {
  try {
    // 🔹 Trae al usuario y "popula" el campo 'car' si existe
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("car"); // 👈 esta línea trae los datos del carro

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error en getMe:", error);
    res.status(500).json({ message: error.message });
  }
};

// 🟡 Actualizar datos del usuario autenticado
export const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      select: "-password",
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📸 Subir o actualizar foto de perfil
export const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No se subió ninguna imagen" });

    // Subir imagen a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "users",
      transformation: [{ width: 500, height: 500, crop: "thumb", gravity: "face" }],
    });

    // Actualizar el usuario con la nueva URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { photo: result.secure_url },
      { new: true, select: "-password" }
    );

    // Borrar archivo temporal
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error al eliminar archivo temporal:", err);
    });

    res.status(200).json({
      message: "Foto de perfil actualizada correctamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al subir foto:", error);
    res.status(500).json({
      message: "Error al subir foto de perfil",
      error: error.message,
    });
  }
};
