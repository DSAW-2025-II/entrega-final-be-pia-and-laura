import mongoose from "mongoose";
import Reservation from "../models/Reservation.js";
import Trip from "../models/Trip.js";

/* ============================================================
   1. CREATE RESERVATION
============================================================ */
export const createReservation = async (req, res) => {
  try {
    const { trip, seats, note } = req.body;
    const passenger = req.user.id;

    if (!trip) return res.status(400).json({ message: "Trip ID is required" });

    const tripData = await Trip.findById(trip);
    if (!tripData) return res.status(404).json({ message: "Trip not found" });

    if (tripData.seats <= 0)
      return res.status(400).json({ message: "Trip is full" });

    if (seats > tripData.seats)
      return res.status(400).json({
        message: `Only ${tripData.seats} seats available`,
      });

    tripData.seats -= seats;
    await tripData.save();

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
    console.error("Error creating reservation:", error);
    res.status(500).json({ message: "Error creating reservation" });
  }
};


/* ============================================================
   2. GET RESERVATIONS BY USER (same as yours)
============================================================ */
export const getReservationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

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
      .populate("trip")
      .populate("passenger", "name email photo")
      .populate("driver", "name email photo")
      .sort({ date: 1 });

    const today = [];
    const tomorrow = [];

    const nowCol = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Bogota" })
    );

    const todayStart = new Date(nowCol);
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const afterTomorrowStart = new Date(todayStart);
    afterTomorrowStart.setDate(todayStart.getDate() + 2);

    reservations.forEach((r) => {
      const local = new Date(
        new Date(r.date).toLocaleString("en-US", { timeZone: "America/Bogota" })
      );

      if (local >= todayStart && local < tomorrowStart) today.push(r);
      else if (local >= tomorrowStart && local < afterTomorrowStart)
        tomorrow.push(r);
    });

    res.status(200).json({ today, tomorrow });

  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ message: "Error fetching reservations" });
  }
};


/* ============================================================
   3. UPDATE RESERVATION (ONLY ACCEPT / DECLINE)
============================================================ */
export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid reservation ID" });
    }

    // 2. Find reservation
    const reservation = await Reservation.findById(id).populate("driver");

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // 3. Only driver can update
    const userId = req.user.id.toString();
    const isDriver = reservation.driver?._id?.toString() === userId;

    if (!isDriver) {
      return res.status(403).json({ message: "Only the driver can update reservations" });
    }

    // 4. Allowed statuses
    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Allowed: accepted, declined",
      });
    }

    // 5. Update status
    reservation.status = status;
    await reservation.save();

    res.status(200).json(reservation);

  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({ message: "Error updating reservation", error });
  }
};
