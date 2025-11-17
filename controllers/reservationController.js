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

    // 🛑 Bloqueo si no hay asientos disponibles
    if (tripData.seats <= 0) {
      return res.status(400).json({ message: "Trip is full" });
    }

    // 🛑 Bloqueo si intenta reservar más asientos de los disponibles
    if (seats > tripData.seats) {
      return res.status(400).json({
        message: `Only ${tripData.seats} seats available`,
      });
    }

    // 🟢 Restar asientos disponibles
    tripData.seats -= seats;
    await tripData.save();

    // Crear reserva
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
      status: "pending",
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

    // 🔥 Ajustar fechas a zona horaria de Colombia
    const nowColombia = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Bogota" })
    );

    const todayStart = new Date(nowColombia);
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const dayAfterTomorrowStart = new Date(todayStart);
    dayAfterTomorrowStart.setDate(todayStart.getDate() + 2);

    reservations.forEach((r) => {
      const localDate = new Date(
        new Date(r.date).toLocaleString("en-US", { timeZone: "America/Bogota" })
      );

      if (localDate >= todayStart && localDate < tomorrowStart) {
        today.push(r);
      } else if (localDate >= tomorrowStart && localDate < dayAfterTomorrowStart) {
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
export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reservation = await Reservation.findById(id).populate("driver");

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const userId = req.user.id.toString();
    const isDriver = reservation.driver?._id === userId;
    const isPassenger = reservation.passenger?._id === userId;

    if (!isPassenger && !isDriver) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Solo el conductor puede: confirmed / declined
    if ((status === "confirmed" || status === "declined") && !isDriver) {
      return res.status(403).json({ message: "Only the driver can accept/decline" });
    }

    // Solo el pasajero puede cancelar
    if (status === "cancelled" && !isPassenger) {
      return res.status(403).json({ message: "Only the passenger can cancel" });
    }

    reservation.status = status;
    await reservation.save();

    res.status(200).json(reservation);

  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({ message: "Error updating reservation" });
  }
};
