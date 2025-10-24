import express from "express";
import { registerCar } from "../controllers/carController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/login",
  upload.fields([
    { name: "carPhoto", maxCount: 1 },
    { name: "soat", maxCount: 1 },
  ]),
  registerCar
);

export default router;
