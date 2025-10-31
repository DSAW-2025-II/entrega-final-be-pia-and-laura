import Reservation from "../models/Reservation.js";

export const createReservation = async (req, res) => {
  try {
    const { driver, passenger, date, origin, destination, price } = req.body;

    const newReservation = new Reservation({
      driver,
      passenger,
      date,
      origin,
      destination,
      price,
    });

    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (error) {
    console.error("Error al crear la reserva:", error);
    res.status(500).json({ message: "Error al crear la reserva" });
  }
};

export const getReservationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Comparar el usuario autenticado con el solicitado
    if (
      req.user.id?.toString() !== userId &&
      req.user._id?.toString() !== userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const reservations = await Reservation.find({
      $or: [{ passenger: userId }, { driver: userId }],
    })
      .populate("passenger", "name email")
      .populate("driver", "name email")
      .sort({ date: 1 });

    if (!reservations.length) {
      return res.status(200).json({ today: [], tomorrow: [] });
    }

    // Separar reservas por fecha
    const today = [];
    const tomorrow = [];
    const todayDate = new Date().toDateString();
    const tomorrowDate = new Date(Date.now() + 86400000).toDateString();

    reservations.forEach((r) => {
      const resDate = new Date(r.date).toDateString();
      if (resDate === todayDate) today.push(r);
      else if (resDate === tomorrowDate) tomorrow.push(r);
    });

    res.status(200).json({ today, tomorrow });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).json({ message: "Error al obtener reservas" });
  }
};
