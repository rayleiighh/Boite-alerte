const Event = require("../models/Event");

// POST /api/events
exports.addEvent = async (req, res) => {
  try {
    const { type, timestamp, deviceID } = req.body;

    if (!type || !timestamp || !deviceID) {
      return res
        .status(400)
        .json({ error: "Champs manquants : { type, timestamp, deviceID }" });
    }

    const event = new Event({
      type,
      timestamp: new Date(timestamp),
      deviceID,
    });

    await event.save();

    res.status(200).json({ message: "✅ Event enregistré avec succès", event });
  } catch (err) {
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};

// GET /api/events/latest - récupérer le dernier événement pour le dashboard
exports.getLatestEvent = async (req, res) => {
  try {
    // Récupérer le dernier événement
    const latestEvent = await Event.findOne().sort({ createdAt: -1 });

    if (!latestEvent) {
      return res.json({
        hasEvent: false,
        status: "empty",
        message: "Aucun courrier détecté",
      });
    }

    // Déterminer l'état de la boîte basé sur le dernier événement
    let status = "empty";
    let message = "";

    switch (latestEvent.type) {
      case "mail_received":
      case "courrier":
        status = "mail";
        message = `Courrier reçu le ${latestEvent.timestamp.toLocaleDateString("fr-FR")} à ${latestEvent.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
        break;
      case "package_received":
      case "colis":
        status = "package";
        message = `Colis reçu le ${latestEvent.timestamp.toLocaleDateString("fr-FR")} à ${latestEvent.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
        break;
      case "box_opened":
      case "ouverture":
        status = "empty";
        message = `Boîte ouverte le ${latestEvent.timestamp.toLocaleDateString("fr-FR")} à ${latestEvent.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
        break;
      default:
        status = "empty";
        message = `Dernier événement le ${latestEvent.timestamp.toLocaleDateString("fr-FR")} à ${latestEvent.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
    }

    res.json({
      hasEvent: true,
      status,
      message,
      lastEvent: {
        type: latestEvent.type,
        timestamp: latestEvent.timestamp,
        deviceID: latestEvent.deviceID,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};

// GET /api/events (avec pagination et filtres)
exports.getEvents = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtres
    const filters = {};

    if (req.query.type && req.query.type !== "all") {
      filters.type = req.query.type;
    }

    if (req.query.deviceID) {
      filters.deviceID = req.query.deviceID;
    }

    if (req.query.startDate || req.query.endDate) {
      filters.timestamp = {};
      if (req.query.startDate)
        filters.timestamp.$gte = new Date(req.query.startDate);
      if (req.query.endDate)
        filters.timestamp.$lte = new Date(req.query.endDate);
    }

    // 🔍 Recherche textuelle
    if (req.query.search) {
      const search = req.query.search.trim();
      filters.$or = [
        { type: { $regex: search, $options: "i" } },
        { deviceID: { $regex: search, $options: "i" } },
        // possibilité de rechercher une date sous forme de chaîne (approximative)
      ];
    }

    // Récupération filtrée et paginée
    const events = await Event.find(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(filters);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      events,
    });
  } catch (err) {
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};
// DELETE /api/events/:id - supprimer un événement
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ error: "Événement non trouvé" });
    }

    res.json({ success: true, message: "✅ Événement supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};
