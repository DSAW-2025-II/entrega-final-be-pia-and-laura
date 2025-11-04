export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha enviado ningún archivo" });
    }

    // multer-storage-cloudinary devuelve la URL directa
    const imageUrl = req.file.path;

    res.json({
      message: "Archivo subido correctamente",
      url: imageUrl,
    });
  } catch (error) {
    console.error("Error al subir:", error);
    res.status(500).json({ error: "Error al subir archivo" });
  }
};
