import Car from "../models/Car.js";

export const registerCar = async (req, res) => {
  try {
    const { licensePlate, capacity, make, model } = req.body;

    if (!licensePlate || !capacity || !make || !model) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    const licenseRegex = /^[A-Z]{3}[0-9]{3}$/;
    if (!licenseRegex.test(licensePlate.toUpperCase())) {
      return res.status(400).json({ message: "La placa debe tener 3 letras y 3 números (ej: ABC123)." });
    }

    const existingCar = await Car.findOne({ licensePlate: licensePlate.toUpperCase() });
    if (existingCar) {
      return res.status(400).json({ message: "Este vehículo ya está registrado." });
    }

    // ✅ Ahora las URLs vienen directamente desde Cloudinary
    const carPhoto = req.files["carPhoto"]?.[0]?.path;
    const soat = req.files["soat"]?.[0]?.path;

    if (!carPhoto || !soat) {
      return res.status(400).json({ message: "Faltan archivos del vehículo o del SOAT." });
    }

    const newCar = new Car({
      licensePlate: licensePlate.toUpperCase(),
      capacity,
      make,
      model,
      carPhotoUrl: carPhoto,
      soatUrl: soat,
    });

    await newCar.save();
    res.status(201).json({ message: "Vehículo registrado con éxito", car: newCar });
  } catch (error) {
    console.error("❌ Error al registrar el vehículo:", error);
    res.status(500).json({ message: "Error al registrar el vehículo.", error: error.message });
  }
};
