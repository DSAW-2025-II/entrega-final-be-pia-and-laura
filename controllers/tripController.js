import Trip from "../models/Trip.js";

// Crear un nuevo viaje
// Crear un nuevo viaje
export const createTrip = async (req, res) => {
  try {
    const { startPoint, endPoint, route, departureTime, seats, price } = req.body;
    const { startCoords, endCoords } = req.body;

    if (!startPoint || !endPoint || !departureTime || !seats || !price) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    if (price < 1400) {
      return res.status(400).json({ message: "Minimum price is $1.400" });
    }

    if (seats < 1) {
      return res.status(400).json({ message: "There must be at least 1 seat available" });
    }

    // Convertir fecha a hora Colombia (UTC-5)
    let tripDate = new Date(departureTime);
    tripDate = new Date(tripDate.getTime() - (5 * 60 * 60 * 1000));

    // Validar que no sea anterior a la actual
    const nowColombia = new Date(Date.now() - (5 * 60 * 60 * 1000));

    if (tripDate < nowColombia) {
      return res.status(400).json({ message: "Date must be in the future" });
    }

    const newTrip = new Trip({
      startPoint,
      endPoint,
      route,
      departureTime: tripDate, // guardamos la fecha corregida
      seats,
      price,
      driver: req.user.id,
      startCoords,
      endCoords,
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);

  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ message: "Error creating trip" });
  }
};


// Obtener todos los viajes disponibles (para pasajeros)
export const getAvailableTrips = async (req, res) => {
  try {
    const { seats } = req.query; // 🔹 viene del frontend: ?seats=2

    // Base: solo viajes con al menos 1 asiento disponible
    let filter = { seats: { $gt: 0 } };

    // 🔹 Si se pasa un filtro de asientos, lo aplicamos
    if (seats) {
      filter.seats = { $gte: parseInt(seats) };
    }

    const trips = await Trip.find(filter)
      .populate("driver", "name photo")
      .sort({ departureTime: 1 });

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Error fetching trips" });
  }
};


// Obtener viajes creados por el conductor autenticado
export const getDriverTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ driver: req.user.id });
    res.status(200).json(trips);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user trips" });
  }
};

// Eliminar un viaje (solo si pertenece al conductor)
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this trip" });
    }

    await trip.deleteOne();
    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting trip" });
  }
};

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export const searchTrips = async (req, res) => {
  const { lat, lng, radius = 5, seats } = req.query;

  try {
    const trips = await Trip.find().populate("driver", "name photo");

    const filteredTrips = trips.filter((trip) => {
      if (!trip.endCoords || trip.endCoords.length < 2) return false;

      const distance = haversine(
        parseFloat(trip.endCoords[1]), // lat stored
        parseFloat(trip.endCoords[0]), // lng stored
        parseFloat(lat),
        parseFloat(lng)
      );

      return distance <= radius;
    });

    const seatsFiltered = seats
      ? filteredTrips.filter((t) => t.seats >= parseInt(seats))
      : filteredTrips;

    console.log("🟢 Viajes filtrados:", seatsFiltered.length, seatsFiltered);
    res.json(seatsFiltered);

  } catch (error) {
    console.error("❌ Error en searchTrips:", error);
    res.status(500).json({ error: "Error al buscar viajes" });
  }
};
