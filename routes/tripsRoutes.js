import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createTrip,
  getAvailableTrips,
  getDriverTrips,
  deleteTrip,
} from "../controllers/tripController.js";

const router = express.Router();

// Crear un viaje (solo conductores)
router.post("/", auth, createTrip);

// Obtener todos los viajes disponibles (para pasajeros)
router.get("/", getAvailableTrips);

// Obtener viajes del conductor autenticado
router.get("/my-trips", auth, getDriverTrips);

// Eliminar un viaje propio
router.delete("/:id", auth, deleteTrip);

export default router;
