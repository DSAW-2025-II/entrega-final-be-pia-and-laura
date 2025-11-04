import Car from "../models/Car.js";
import User from "../models/User.js"; // 👈 modelo de usuario

// ==========================
// 🚘 REGISTRAR CARRO
// ==========================
export const registerCar = async (req, res) => {
  try {
    const { licensePlate, capacity, make, model } = req.body;
    const userId = req.user.id;

    if (!licensePlate || !capacity || !make || !model) {
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    // 🛑 Verificar si el usuario ya tiene un carro
    const existingUserCar = await Car.findOne({ owner: userId });
    if (existingUserCar) {
      return res.status(400).json({
        message: "Ya tienes un vehículo registrado. Solo se permite uno por conductor."
      });
    }

    // 🛑 Validar formato de placa
    const licenseRegex = /^[A-Z]{3}[0-9]{3}$/;
    if (!licenseRegex.test(licensePlate.toUpperCase())) {
      return res.status(400).json({
        message: "La placa debe tener 3 letras y 3 números (ej: ABC123)."
      });
    }

    // 🛑 Verificar si la placa ya está registrada
    const existingCar = await Car.findOne({
      licensePlate: licensePlate.toUpperCase()
    });
    if (existingCar) {
      return res.status(400).json({ message: "Este vehículo ya está registrado." });
    }

    // 📸 Archivos subidos
    const carPhoto = req.files["carPhoto"]?.[0]?.path;
    const soat = req.files["soat"]?.[0]?.path;

    if (!carPhoto || !soat) {
      return res
        .status(400)
        .json({ message: "Faltan archivos del vehículo o del SOAT." });
    }

    // ✅ Crear y guardar nuevo carro
    const newCar = new Car({
      licensePlate: licensePlate.toUpperCase(),
      capacity,
      make,
      model,
      carPhotoUrl: carPhoto,
      soatUrl: soat,
      owner: userId
    });

    await newCar.save();

    // ✅ Actualizar el usuario con el ID del carro
    await User.findByIdAndUpdate(userId, { car: newCar._id }, { new: true });

    res.status(201).json({
      message: "Vehículo registrado con éxito 🚗",
      car: newCar
    });
  } catch (error) {
    console.error("❌ Error al registrar el vehículo:", error);
    res
      .status(500)
      .json({ message: "Error al registrar el vehículo.", error: error.message });
  }
};


// ==========================
// 🚗 OBTENER EL CARRO DEL USUARIO AUTENTICADO
// ==========================
export const getMyCar = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar el carro del usuario y popular algunos datos del dueño
    const car = await Car.findOne({ owner: userId }).populate("owner", "name email role");

    if (!car) {
      return res.status(404).json({ message: "No se encontró ningún carro asociado a este usuario." });
    }

    res.status(200).json({ car });
  } catch (error) {
    console.error("❌ Error al obtener el carro:", error);
    res.status(500).json({
      message: "Error al obtener el carro.",
      error: error.message,
    });
  }
};


// ==========================
// ✏️ ACTUALIZAR DATOS DEL CARRO
// ==========================
export const updateCar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { licensePlate, capacity, make, model } = req.body;

    // 🕵️ Buscar el carro del usuario autenticado
    const car = await Car.findOne({ owner: userId });
    if (!car) {
      return res.status(404).json({ message: "No se encontró el carro del usuario." });
    }

    // 🛑 Validar formato de placa si se envía una nueva
    if (licensePlate) {
      const licenseRegex = /^[A-Z]{3}[0-9]{3}$/;
      if (!licenseRegex.test(licensePlate.toUpperCase())) {
        return res.status(400).json({
          message: "La placa debe tener 3 letras y 3 números (ej: ABC123)."
        });
      }

      // Verificar que no esté usada por otro carro
      const existingCar = await Car.findOne({
        licensePlate: licensePlate.toUpperCase(),
        _id: { $ne: car._id },
      });
      if (existingCar) {
        return res.status(400).json({
          message: "Esta placa ya está registrada en otro vehículo."
        });
      }
    }

    // 📸 Manejo de archivos (Cloudinary)
    const carPhoto = req.files?.carPhoto?.[0]?.path;
    const soat = req.files?.soat?.[0]?.path;

    // 🔄 Actualizar solo los campos enviados
    if (licensePlate) car.licensePlate = licensePlate.toUpperCase();
    if (capacity) car.capacity = capacity;
    if (make) car.make = make;
    if (model) car.model = model;
    if (carPhoto) car.carPhotoUrl = carPhoto;
    if (soat) car.soatUrl = soat;

    await car.save();

    res.status(200).json({
      message: "✅ Vehículo actualizado correctamente.",
      car,
    });
  } catch (error) {
    console.error("❌ Error al actualizar el vehículo:", error);
    res.status(500).json({
      message: "Error al actualizar los datos del vehículo.",
      error: error.message,
    });
  }
};
