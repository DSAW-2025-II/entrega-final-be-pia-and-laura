import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  idUniversidad: String,
  email: { type: String, required: true, unique: true },
  celular: String,
  password: { type: String, required: true },
  role: { type: String, enum: ["driver", "passenger"], required: true },
});

export default mongoose.model("User", userSchema);
