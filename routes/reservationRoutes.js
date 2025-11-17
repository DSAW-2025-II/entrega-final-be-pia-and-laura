import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createReservation,
  getReservationsByUser,
  updateReservation,
} from "../controllers/reservationController.js";

const router = express.Router();

router.post("/", auth, createReservation);
router.put("/status/:id", auth, updateReservation);   // ⭐ SOLO ESTE
router.get("/:userId", auth, getReservationsByUser);

export default router;
