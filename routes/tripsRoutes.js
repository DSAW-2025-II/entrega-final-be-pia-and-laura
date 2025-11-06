import express from "express";
import Trip from "../models/Trip.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   POST /api/trips
 * @desc    Crear un nuevo viaje
 * @access  Private (solo conductores autenticados)
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { startPoint, endPoint, route, departureTime, seats, price } = req.body;

    if (!startPoint || !endPoint || !departureTime || !seats || !price) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const newTrip = new Trip({
      startPoint,
      endPoint,
      route,
      departureTime,
      seats,
      price,
      driver: req.user.id, // <- viene del token JWT
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ message: "Error creating trip" });
  }
});

/**
 * @route   GET /api/trips
 * @desc    Obtener todos los viajes disponibles
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find().populate("driver", "name profileImage");
    res.json(trips);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching trips" });
  }
});

/**
 * @route   GET /api/trips/my-trips
 * @desc    Obtener los viajes creados por el conductor autenticado
 * @access  Private
 */
router.get("/my-trips", verifyToken, async (req, res) => {
  try {
    const trips = await Trip.find({ driver: req.user.id });
    res.json(trips);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user trips" });
  }
});

/**
 * @route   DELETE /api/trips/:id
 * @desc    Eliminar un viaje (solo si pertenece al conductor)
 * @access  Private
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this trip" });
    }

    await trip.deleteOne();
    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting trip" });
  }
});

export default router;
