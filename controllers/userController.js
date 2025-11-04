import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";
import streamifier from "streamifier"; // 👈 lo usaremos para subir buffers a Cloudinary

// 🟡 Actualizar datos del usuario autenticado
export const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const { password, ...rest } = req.body;
    const updateData = { ...rest };

    // 🔹 Si hay nueva contraseña
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // 🔹 Si llega nueva imagen (desde memoria)
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "profile_images",
            transformation: [{ width: 500, height: 500, crop: "fill" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      updateData.profileImage = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

// 📸 Subir o actualizar foto de perfil
export const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No se subió ninguna imagen" });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "user",
          transformation: [
            { width: 500, height: 500, crop: "thumb", gravity: "face" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { photo: result.secure_url },
      { new: true, select: "-password" }
    );

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
