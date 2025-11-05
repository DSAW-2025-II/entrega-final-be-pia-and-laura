import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const auth = async (req, res, next) => {
  try {
    console.log("🧩 auth middleware ejecutado, headers:", req.headers.authorization);
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET no está definido en las variables de entorno.");
      return res.status(500).json({ message: "Error interno del servidor." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ⚠️ Verifica si tu token tiene "id" o "_id"
    const userId = decoded.id || decoded._id;
    if (!userId) {
      console.error("❌ Token inválido: no contiene id del usuario.");
      return res.status(401).json({ message: "Token inválido." });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado." });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (err) {
    console.error("❌ Error en auth middleware:", err);
    return res.status(401).json({ message: "Token inválido o expirado." });
  }
};
