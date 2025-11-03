import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  universityId: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, enum: ["driver", "passenger"], required: true, default: "passenger" },
  photo: { type: String, default: "" },
  car: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Car", 
    default: null // 👈 si no tiene carro, será null
  },
});

export default mongoose.model("User", userSchema);
