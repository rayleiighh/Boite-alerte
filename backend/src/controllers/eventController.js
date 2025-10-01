const Event = require("../models/Event");

// POST /api/events
exports.addEvent = async (req, res) => {
  try {
    const { type, timestamp, deviceID } = req.body;

    if (!type || !timestamp || !deviceID) {
      return res.status(400).json({ error: "Champs manquants : { type, timestamp, deviceID }" });
    }

    const event = new Event({
      type,
      timestamp: new Date(timestamp),
      deviceID
    });

    await event.save();

    res.status(200).json({ message: "✅ Event enregistré avec succès", event });
  } catch (err) {
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};

// GET /api/events (avec pagination et filtres)
exports.getEvents = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;  // par défaut page 1
    const limit = parseInt(req.query.limit) || 10; // par défaut 10 résultats
    const skip = (page - 1) * limit;

    // Filtres
    const filters = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.deviceID) filters.deviceID = req.query.deviceID;
    if (req.query.startDate || req.query.endDate) {
      filters.timestamp = {};
      if (req.query.startDate) filters.timestamp.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filters.timestamp.$lte = new Date(req.query.endDate);
    }

    // Récupération filtrée et paginée
    const events = await Event.find(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    // Compter le total (pour le frontend)
    const total = await Event.countDocuments(filters);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      events
    });
  } catch (err) {
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};
