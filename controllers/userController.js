import User from "../models/User.js";

// 🟢 Cambiar el rol del usuario autenticado
export const updateRole = async (req, res) => {
  try {
    const userId = req.user.id; // viene del token
    const { newRole } = req.body;

    // Validar roles válidos
    const validRoles = ["passenger", "driver"];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: "Rol no válido" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: `Rol actualizado a ${newRole} correctamente.`,
      user,
    });
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    res.status(500).json({ message: "Error al actualizar rol" });
  }
};

// GET /api/v1/users/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // id viene del token
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/v1/users/:id
export const updateUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, select: "-password" }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};