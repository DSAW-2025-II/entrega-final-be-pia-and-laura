import express from "express";
import { auth } from "../middleware/auth.js";
import {
  createReservation,
  getReservationsByUser,
  cancelReservation,
  updateReservation,
} from "../controllers/reservationController.js";

const router = express.Router();

router.post("/", auth, createReservation);
router.put("/:id/cancel", auth, cancelReservation);
router.put("/status/:id", auth, updateReservation);
router.get("/:userId", auth, getReservationsByUser);

export default router;
