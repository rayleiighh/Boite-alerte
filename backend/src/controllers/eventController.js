import Event from "../models/Event.js";

// ========== CACHE ANTI-DOUBLON ==========
const idempotencyCache = new Map();
const IDEMPOTENCY_TTL = 5 * 60 * 1000; // 5 minutes

setInterval(() => {
  const now = Date.now();
  for (const [key, data] of idempotencyCache.entries()) {
    if (now - data.timestamp > IDEMPOTENCY_TTL) {
      idempotencyCache.delete(key);
    }
  }
}, 10 * 60 * 1000);

// ========== POST /api/events ==========
export const addEvent = async (req, res) => {
  try {
    const { type, timestamp, deviceID } = req.body;

    if (!type || !timestamp || !deviceID) {
      return res.status(400).json({
        error: "Champs manquants : { type, timestamp, deviceID }",
      });
    }

    // ✅ Gestion anti-doublon (Idempotency-Key)
    const idempotencyKey = req.headers["idempotency-key"];
    if (idempotencyKey) {
      if (idempotencyCache.has(idempotencyKey)) {
        const cached = idempotencyCache.get(idempotencyKey);
        console.log(`♻️ [DEDUP] Idempotency-Key déjà vu : ${idempotencyKey}`);
        return res.status(200).json({
          message: "✅ Event déjà enregistré (idempotence)",
          event: cached.event,
          cached: true,
        });
      }
    }

    // ✅ Création de l'événement
    const event = new Event({
      type,
      timestamp: new Date(timestamp),
      deviceID,
    });

    await event.save();

    const localTime = new Date(timestamp).toLocaleString("fr-BE", {
      timeZone: "Europe/Brussels",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    console.log(
      `📬 [EVENT] Nouveau courrier : ${type} | ${deviceID} | ${localTime} (local)`
    );

    if (idempotencyKey) {
      idempotencyCache.set(idempotencyKey, {
        event,
        timestamp: Date.now(),
      });
    }

    res.status(201).json({
      message: "✅ Event enregistré avec succès",
      event,
    });
  } catch (err) {
    console.error("❌ [ERROR] addEvent:", err.message);
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};

// ========== GET /api/events/latest ==========
export const getLatestEvent = async (req, res) => {
  try {
    const latestEvent = await Event.findOne().sort({ createdAt: -1 });

    if (!latestEvent) {
      return res.json({
        hasEvent: false,
        status: "empty",
        message: "Aucun courrier détecté",
      });
    }

    let status = "empty";
    let message = "";

    const dateOptions = {
      timeZone: "Europe/Brussels",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    const timeOptions = {
      timeZone: "Europe/Brussels",
      hour: "2-digit",
      minute: "2-digit",
    };

    const localDate = latestEvent.timestamp.toLocaleDateString("fr-FR", dateOptions);
    const localTime = latestEvent.timestamp.toLocaleTimeString("fr-FR", timeOptions);

    switch (latestEvent.type) {
      case "mail_received":
      case "courrier":
        status = "mail";
        message = `Courrier reçu le ${localDate} à ${localTime}`;
        break;
      case "package_received":
      case "colis":
        status = "package";
        message = `Colis reçu le ${localDate} à ${localTime}`;
        break;
      case "box_opened":
      case "ouverture":
        status = "empty";
        message = `Boîte ouverte le ${localDate} à ${localTime}`;
        break;
      default:
        status = "empty";
        message = `Dernier événement le ${localDate} à ${localTime}`;
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
    console.error("❌ [ERROR] getLatestEvent:", err.message);
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};

// ========== GET /api/events (pagination + filtres) ==========
export const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

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

    if (req.query.search) {
      const search = req.query.search.trim();
      filters.$or = [
        { type: { $regex: search, $options: "i" } },
        { deviceID: { $regex: search, $options: "i" } },
      ];
    }

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
    console.error("❌ [ERROR] getEvents:", err.message);
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};

// ========== DELETE /api/events/:id ==========
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ error: "Événement non trouvé" });
    }

    res.json({ success: true, message: "✅ Événement supprimé avec succès" });
  } catch (err) {
    console.error("❌ [ERROR] deleteEvent:", err.message);
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};
