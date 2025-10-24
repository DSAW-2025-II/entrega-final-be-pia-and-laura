import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  licensePlate: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /^[A-Z]{3}[0-9]{3}$/  // Ejemplo: ABC123
  },
  capacity: { type: Number, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  carPhotoUrl: { type: String },
  soatUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Car", carSchema);
