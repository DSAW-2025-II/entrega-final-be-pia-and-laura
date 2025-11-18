const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ===== TEMP DATA =====
let users = [];
let rides = [];

// ==== AUTH ====
app.post("/signup", (req, res) => {
  users.push(req.body);
  res.json({ message: "User registered", user: req.body });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const found = users.find(u => u.email === email && u.password === password);
  if (!found) return res.status(401).json({ message: "Invalid login" });
  res.json({ message: "Success", user: found });
});

// ==== RIDES ====
app.post("/ride/create", (req, res) => {
  const ride = { id: Date.now(), ...req.body };
  rides.push(ride);
  res.json({ ride });
});

app.get("/rides/all", (req, res) => res.json(rides));

app.get("/rides/driver/:email", (req, res) => {
  res.json(rides.filter(r => r.driverEmail === req.params.email));
});

app.put("/ride/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = rides.findIndex(r => r.id === id);

  if (index === -1) return res.status(404).json({ message: "Ride not found" });

  rides[index] = { ...rides[index], ...req.body };
  res.json({ message: "Updated", ride: rides[index] });
});

app.delete("/ride/:id", (req, res) => {
  const id = parseInt(req.params.id);
  rides = rides.filter(r => r.id !== id);
  res.json({ message: "Deleted" });
});

// START SERVER
app.listen(4000, () => console.log("Server running on port 4000"));
