require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());

// ------------------ DATABASE CONNECTION ------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ------------------ USER SCHEMA ------------------
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  universityId: String,
  phone: String,
  email: { type: String, unique: true },
  password: String,
  role: String, // driver or passenger
});

const User = mongoose.model("User", UserSchema);

// ------------------ RIDE SCHEMA ------------------
const RideSchema = new mongoose.Schema({
  ownerEmail: String,
  ownerName: String,
  vehicle: String,
  date: String,
  time: String,
  departure: String,
  arrival: String,
  seats: Number,
  tariff: String,
  createdAt: String
});

const Ride = mongoose.model("Ride", RideSchema);

// ------------------ ROUTES ------------------

// REGISTER
app.post("/signup", async (req, res) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      ...req.body,
      password: hashed
    });
    res.json({ msg: "Registered successfully", user });
  } catch (err) {
    res.status(500).json({ msg: "Error registering user", err });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(400).json({ msg: "Invalid password" });

    res.json({ msg: "Login successful", user });
  } catch (err) {
    res.status(500).json({ msg: "Login failed", err });
  }
});

// RESET PASSWORD
app.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Email not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ msg: "Reset error", err });
  }
});

// CREATE RIDE (DRIVER)
app.post("/ride/create", async (req, res) => {
  try {
    const ride = await Ride.create(req.body);
    res.json({ msg: "Ride created", ride });
  } catch (err) {
    res.status(500).json({ msg: "Could not create ride", err });
  }
});

// GET RIDES FOR DRIVER
app.get("/rides/driver/:email", async (req, res) => {
  const rides = await Ride.find({ ownerEmail: req.params.email });
  res.json(rides);
});

// GET ALL RIDES (Passenger view)
app.get("/rides/all", async (req, res) => {
  const rides = await Ride.find();
  res.json(rides);
});

// DELETE RIDE
app.delete("/ride/:id", async (req, res) => {
  await Ride.findByIdAndDelete(req.params.id);
  res.json({ msg: "Ride deleted" });
});

// UPDATE RIDE
app.put("/ride/:id", async (req, res) => {
  const updated = await Ride.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// ------------------ START SERVER ------------------
app.listen(process.env.PORT, () =>
  console.log("Server running on port " + process.env.PORT)
);