import Car from "../models/Car.js";

export const uploadPhoto = async (req, res) => {
  try {
    console.log("📤 req.user recibido en upload:", req.user);
    // 🧩 1️⃣ Verifica que Multer haya recibido un archivo
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = req.file.path; // CloudinaryStorage guarda la URL en 'path'
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 🧩 2️⃣ Buscar el carro asociado al usuario
    const updatedCar = await Car.findOneAndUpdate(
      { user: userId },
      { carPhotoUrl: imageUrl },
      { new: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found for this user" });
    }

    // 🧩 3️⃣ Enviar respuesta exitosa
    res.status(200).json({
      message: "✅ Photo updated successfully",
      url: imageUrl,
      car: updatedCar,
    });
  } catch (error) {
    // 🧩 4️⃣ Log detallado del error para depuración
    console.error("❌ Error uploading image:", error.message);
    if (error.stack) console.error(error.stack);

    res.status(500).json({
      message: error.message || "Error uploading image",
      error: error.stack,
    });
  }
};
