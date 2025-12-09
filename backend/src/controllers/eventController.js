const Event = require("../models/Event");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendNotificationEmail } = require("../services/mailer");

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

// ========== POST /api/events (ENRICHI Phase 1 + EMAILS) ==========
exports.addEvent = async (req, res) => {
  try {
    const { 
      type, 
      timestamp, 
      deviceID,
      // Nouveaux champs enrichis (optionnels pour rétrocompatibilité)
      weight_g,
      rssi,
      beam_state,
      uptime_s,
      event_count,
      battery_percent
    } = req.body;

    // Validation champs obligatoires
    if (!type || !timestamp || !deviceID) {
      return res.status(400).json({
        error: "Champs manquants : { type, timestamp, deviceID }",
      });
    }

    // Idempotence check
    const idempotencyKey = req.headers["idempotency-key"];
    if (idempotencyKey && idempotencyCache.has(idempotencyKey)) {
      const cached = idempotencyCache.get(idempotencyKey);
      console.log(`♻️ [DEDUP] Idempotency-Key déjà vu : ${idempotencyKey}`);
      return res.status(200).json({
        message: "✅ Event déjà enregistré (idempotence)",
        event: cached.event,
        cached: true,
      });
    }

    // ========== MAPPING DU TYPE ==========
    const low = (type || "").toLowerCase();
    const notifType = low.includes("colis") || low.includes("package") ? "package" 
      : low.includes("alerte") || low.includes("alert") ? "alert" 
      : "mail";

    const title = notifType === "package" ? "Colis détecté"
      : notifType === "alert" ? "Alerte système"
      : "Nouvelle lettre reçue";

    const description = notifType === "package"
      ? "Un colis est en attente de récupération."
      : notifType === "alert"
      ? "Veuillez vérifier la boîte aux lettres."
      : "Un courrier a été déposé dans votre boîte.";

    // ========== CRÉATION EVENT ==========
    const event = new Event({
      type,
      timestamp: new Date(timestamp),
      deviceID,
      // Stats enrichies (Phase 1)
      weight_g: weight_g !== undefined ? weight_g : null,
      rssi: rssi !== undefined ? rssi : null,
      beam_state: beam_state !== undefined ? beam_state : null,
      uptime_s: uptime_s !== undefined ? uptime_s : null,
      event_count: event_count !== undefined ? event_count : null,
      battery_percent: battery_percent !== undefined ? battery_percent : null
    });

    await event.save();

    // ========== CRÉATION NOTIFICATION ==========
    const notification = new Notification({
      eventId: event._id,
      type: notifType,
      title,
      description,
      timestamp: new Date(timestamp),
      deviceID,
      isNew: true,
    });
    await notification.save();
    console.log("📝 Notification créée:", notification._id);

    // ========== ENVOI EMAILS ==========
    let emailsSent = 0;
    try {
      const users = await User.find({ active: true }).select("email");
      console.log(`📧 Envoi d'emails à ${users.length} utilisateur(s) inscrit(s)`);

      const whenText = new Date(timestamp).toLocaleString("fr-FR", {
        timeZone: "Europe/Brussels",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      for (const user of users) {
        try {
          await sendNotificationEmail({
            type: notifType,
            title,
            description,
            when: whenText,
            to: user.email,
          });
          console.log(`✅ Email envoyé à ${user.email}`);
          emailsSent++;
        } catch (emailErr) {
          console.error(`❌ Erreur email pour ${user.email}:`, emailErr.message);
        }
      }
    } catch (userErr) {
      console.error("❌ Erreur récupération utilisateurs:", userErr.message);
    }

    // ========== BROADCAST WEBSOCKET ==========
    try {
      const { wss } = require("../server");
      if (wss && wss.broadcast) {
        wss.broadcast({
          id: String(notification._id),
          type: notifType,
          title,
          description,
          time: new Date(timestamp).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isNew: true,
        });
        console.log("📡 WebSocket broadcast envoyé");
      }
    } catch (wsErr) {
      // WebSocket non disponible, pas grave
    }

    // Logging enrichi
    const localTime = new Date(timestamp).toLocaleString("fr-BE", {
      timeZone: "Europe/Brussels",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    console.log("📬 [EVENT] ==========================================");
    console.log(`  Type           : ${type} → ${notifType}`);
    console.log(`  Device         : ${deviceID}`);
    console.log(`  Timestamp      : ${localTime} (Brussels)`);
    console.log(`  Weight         : ${weight_g !== null && weight_g !== undefined ? weight_g.toFixed(2) + 'g' : 'N/A'}`);
    console.log(`  WiFi Signal    : ${rssi !== null && rssi !== undefined ? rssi + ' dBm' : 'N/A'}`);
    console.log(`  IR Beam        : ${beam_state !== null && beam_state !== undefined ? (beam_state ? 'BLOCKED' : 'FREE') : 'N/A'}`);
    console.log(`  Uptime         : ${uptime_s !== null && uptime_s !== undefined ? Math.floor(uptime_s / 60) + 'min' : 'N/A'}`);
    console.log(`  Event #        : ${event_count !== null && event_count !== undefined ? event_count : 'N/A'}`);
    console.log(`  Battery        : ${battery_percent !== null && battery_percent !== undefined ? battery_percent + '%' : 'N/A'}`);
    console.log(`  📧 Emails sent : ${emailsSent}`);
    console.log("==================================================");

    // Cache pour idempotence
    if (idempotencyKey) {
      idempotencyCache.set(idempotencyKey, {
        event,
        timestamp: Date.now(),
      });
    }

    res.status(201).json({
      message: "✅ Event enregistré avec succès",
      event,
      notification: notification._id,
      emailsSent,
    });
  } catch (err) {
    console.error("❌ [ERROR] addEvent:", err.message);
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};

// ========== GET /api/events/latest ==========
exports.getLatestEvent = async (req, res) => {
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
        // Inclure stats enrichies si disponibles
        weight_g: latestEvent.weight_g,
        rssi: latestEvent.rssi,
        beam_state: latestEvent.beam_state,
        uptime_s: latestEvent.uptime_s,
        event_count: latestEvent.event_count,
        battery_percent: latestEvent.battery_percent
      },
    });
  } catch (err) {
    console.error("❌ [ERROR] getLatestEvent:", err.message);
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};

// ========== GET /api/events (pagination + filtres) ==========
exports.getEvents = async (req, res) => {
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
exports.deleteEvent = async (req, res) => {
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