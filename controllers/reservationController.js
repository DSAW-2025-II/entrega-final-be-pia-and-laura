import Reservation from "../models/Reservation.js";
import Trip from "../models/Trip.js";

export const createReservation = async (req, res) => {
  try {
    const { trip, seats, note } = req.body;

    const passenger = req.user.id;

    const tripData = await Trip.findById(trip);
    if (!tripData) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const newReservation = new Reservation({
      trip,
      passenger,
      driver: tripData.driver,
      carId: tripData.car,

      seats,
      note,

      origin: tripData.startPoint,
      destination: tripData.endPoint,
      date: tripData.departureTime,
      price: tripData.price,

      status: "pending", // 🔥 aunque el modelo ya lo pone por defecto
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

    // Seguridad
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
      .populate("passenger", "name email photo")
      .populate("driver", "name email photo")
      .sort({ date: 1 });

    const today = [];
    const tomorrow = [];

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(todayDate.getDate() + 1);

    reservations.forEach((r) => {
      const resDate = new Date(r.date);
      resDate.setHours(0, 0, 0, 0);

      if (resDate.getTime() === todayDate.getTime()) {
        today.push(r);
      } else if (resDate.getTime() === tomorrowDate.getTime()) {
        tomorrow.push(r);
      }
    });

    res.status(200).json({ today, tomorrow });
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    res.status(500).json({ message: "Error al obtener reservas" });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;

    // 1. Buscar reserva
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.status === "cancelled") {
      return res.status(400).json({ message: "Reservation already cancelled" });
    }

    // 2. Buscar trip asociado
    const trip = await Trip.findById(reservation.trip);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // 3. Devolver los asientos
    trip.seats += reservation.seats;
    await trip.save();

    // 4. Marcar reserva como cancelada
    reservation.status = "cancelled";
    await reservation.save();

    res.json({
      message: "Reservation cancelled successfully",
      reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error cancelling reservation" });
  }
};
