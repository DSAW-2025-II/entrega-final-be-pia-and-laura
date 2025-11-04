import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";


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

// 🟣 Verificar si un correo ya existe
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        exists: true,
        message: "El correo ya está registrado",
      });
    }

    res.status(200).json({
      exists: false,
      message: "Correo disponible",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al verificar el correo" });
  }
};

// 🟢 Obtener perfil del usuario autenticado
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("car");

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

    const { password, ...rest } = req.body;
    const updateData = { ...rest };

    // 🔹 Encriptar contraseña si llega nueva
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // 🔹 Si llega imagen en memoria (desde multer.memoryStorage)
    if (req.file) {
      const fileBase64 = req.file.buffer.toString("base64");
      const upload = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${fileBase64}`,
        {
          folder: "profile_images",
          transformation: [{ width: 500, height: 500, crop: "fill" }],
        }
      );
      updateData.profileImage = upload.secure_url;
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

    const fileBase64 = req.file.buffer.toString("base64");
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${fileBase64}`,
      {
        folder: "user",
        transformation: [
          { width: 500, height: 500, crop: "thumb", gravity: "face" },
        ],
      }
    );

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
