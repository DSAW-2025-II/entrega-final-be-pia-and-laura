import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    trip: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Trip",
      required: true 
    },

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
      ref: "Car",
    },

    seats: { 
      type: Number, 
      required: true, 
      min: 1 
    },

    note: { 
      type: String, 
      trim: true 
    },

    origin: { 
      type: String, 
      required: true 
    },
    destination: { 
      type: String, 
      required: true 
    },

    date: { 
      type: Date, 
      required: true 
    },

    price: { 
      type: Number, 
      required: true 
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "declined"],
      default: "pending",
    },

    pickupPoints: {
      type: [String],
      required: true,
      default: []
    },
  },
  { timestamps: true }
);
export default mongoose.model("Reservation", reservationSchema);
