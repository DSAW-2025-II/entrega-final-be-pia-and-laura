import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  startPoint: { type: String, required: true },
  endPoint: { type: String, required: true },
  route: { type: String },
  departureTime: { type: Date, required: true },
  seats: { type: Number, required: true },
  price: { type: Number, required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  startCoords: { type: Object },
  endCoords: { type: Object },
  startZone: { type: String },
  endZone: { type: String },
  isFull: { type: Boolean, default: false }
}, { timestamps: true });
tripSchema.pre("save", function (next) {
  this.isFull = this.seats <= 0;
  next();
});

export default mongoose.model("Trip", tripSchema);
