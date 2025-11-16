import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createReservation,
  getReservationsByUser,
  cancelReservation,
} from "../controllers/reservationController.js";

const router = express.Router();

// Crear una nueva reserva
router.post("/", auth, createReservation);

// Obtener reservas por usuario
router.get("/:userId", auth, getReservationsByUser);

router.delete("/:id/cancel", auth, cancelReservation);
export default router;
