import express from "express";
const router = express.Router();

// Endpoint para buscar direcciones (geocoding)
router.get("/geocode", async (req, res) => {
  const { place } = req.query;
  const MAPBOX_SECRET = process.env.MAPBOX_SECRET_TOKEN;

  if (!place) {
    return res.status(400).json({ error: "Missing 'place' query parameter" });
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      place
    )}.json?access_token=${MAPBOX_SECRET}&limit=5&language=es&country=CO`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching geocode:", error.message);
    res.status(500).json({ error: "Error fetching geocode" });
  }
});

export default router;
