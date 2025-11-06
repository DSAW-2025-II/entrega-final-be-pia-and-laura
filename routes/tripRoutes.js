import express from "express";
import Trip from "../models/Trip.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Crear viaje
router.post("/", auth, async (req, res) => {
  try {
    const { startPoint, endPoint, route, departureTime, seats, price } = req.body;
    const trip = new Trip({
      startPoint,
      endPoint,
      route,
      departureTime,
      seats,
      price,
      driver: req.user.id,
    });
    await trip.save();
    res.status(201).json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating trip" });
  }
});

export default router;
