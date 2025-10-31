import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    passenger: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    driver: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car", // si tienes un modelo de autos
    },
    destination: { 
      type: String, 
      required: true, 
      trim: true 
    },
    origin: { 
      type: String, 
      required: true, 
      trim: true 
    },
    date: { 
      type: Date, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true } // agrega createdAt y updatedAt automáticamente
);

export default mongoose.model("Reservation", reservationSchema);
