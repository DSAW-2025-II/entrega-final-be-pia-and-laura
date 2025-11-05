import Car from "../models/Car.js"; // o la ruta correcta a tu modelo

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = req.file.path;
    const userId = req.user.id; // asegúrate de tener el user en el token

    // Buscar el carro asociado al usuario y actualizarlo
    const updatedCar = await Car.findOneAndUpdate(
      { user: userId },
      { carPhotoUrl: imageUrl },
      { new: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found for this user" });
    }

    res.status(200).json({
      message: "Photo updated successfully",
      url: imageUrl,
      car: updatedCar,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Error uploading image" });
  }
};
