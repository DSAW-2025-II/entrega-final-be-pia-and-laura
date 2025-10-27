import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";


const router = express.Router();

// REGISTRO
router.post("/register", async (req, res) => {
  try {
    const { name, lastName, universityId, email, phone, password, role } = req.body;

    if (!role || !["driver", "passenger"].includes(role)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "El correo ya está registrado" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      lastName,
      universityId,
      email,
      phone,
      password: hashed,
      role,
    });

    await user.save();

    // 🔹 Crear token automáticamente al registrarse
    const token = jwt.sign(
      { id: user._id, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      token, // ✅ IMPORTANTE
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});


// INICIO DE SESIÓN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son obligatorios" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

    const role = user.role === "driver" ? "driver" : "passenger";

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role,
      },
      process.env.JWT_SECRET, 
      { expiresIn: "7d" } 
    );

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
});

export default router;
