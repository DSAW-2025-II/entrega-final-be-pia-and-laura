import express from "express";
import Trip from "../models/Trip.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   POST /api/trips
 * @desc    Crear un nuevo viaje
 * @access  Private (solo conductores autenticados)
 */
router.post("/", auth, async (req, res) => {
  try {
    const { startPoint, endPoint, route, departureTime, seats, price } = req.body;

    if (!startPoint || !endPoint || !departureTime || !seats || !price) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    if (price < 1400) {
  return res.status(400).json({ message: "Minimum price is $1.400" });
  }
    
  if (seats < 1) {
      return res.status(400).json({ message: "There must be at least 1 seat available" });
    }

    // Validar que la fecha no sea anterior a la actual
const tripDate = new Date(departureTime);
if (tripDate < new Date()) {
  return res.status(400).json({ message: "Date must be in the future" });
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
    const trips = await Trip.find().populate("driver", "name photo");
    res.json(trips);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching trips" });
  }
});

/**
 * @route   GET /api/trips
 * @desc    Obtener los viajes creados por el conductor autenticado
 * @access  Private
 */
router.get("/trips", auth, async (req, res) => {
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
router.delete("/:id", auth, async (req, res) => {
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
