export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha enviado ningún archivo" });
    }

    // multer-storage-cloudinary provides the URL in req.file.path
    const imageUrl = req.file.path;

    return res.json({
      message: "Archivo subido correctamente",
      url: imageUrl, // return `url` for frontend compatibility
      secure_url: imageUrl, // optional, keep for compatibility
    });
  } catch (error) {
    console.error("Error al subir:", error);
    res.status(500).json({ error: "Error al subir archivo" });
  }
};