import upload from "../middlewares/uploadMiddleware.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadPhoto = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No se ha enviado ningún archivo" });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "users", // carpeta opcional
    });

    fs.unlinkSync(file.path);

    res.json({
      message: "Archivo subido correctamente",
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Error al subir:", error);
    res.status(500).json({ error: "Error al subir archivo" });
  }
};
