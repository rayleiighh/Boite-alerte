const Event = require("../models/Event");

// Helpers de mapping pour convertir les types d'events en types de notifications
const mapType = (t = "") => {
  const x = t.toLowerCase();
  if (x.includes("courrier")) return "mail";
  if (x.includes("colis")) return "package";
  if (x.includes("alerte")) return "alert";
  return "mail";
};

// ✅ prettyTime amélioré - affiche correctement "Aujourd'hui", "Hier" ou la date
const prettyTime = (dateLike) => {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();

  // Vérifie si c'était hier
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const wasYesterday = d.toDateString() === yesterday.toDateString();

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  if (sameDay) return `${hh}h${mm}`;
  if (wasYesterday) return `Hier ${hh}h${mm}`;
  
  // Pour les dates plus anciennes : "12/10 14h30"
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) + ` ${hh}h${mm}`;
};

// GET /api/notifications - Récupérer toutes les notifications depuis les events
exports.getNotifications = async (req, res) => {
  try {
    // ✅ Tri avec fallback sur createdAt
    const events = await Event.find()
      .sort({ timestamp: -1, createdAt: -1 }) // fallback createdAt si pas de timestamp
      .limit(200)
      .lean();

    // Transforme les events en format notifications pour le frontend
    const formatted = events.map(ev => {
      const t = mapType(ev.type);
      const eventDate = new Date(ev.timestamp || ev.createdAt || Date.now());
      
      return {
        id: String(ev._id),
        type: t, // "mail" | "package" | "alert"
        title: t === "package" ? "Colis détecté"
             : t === "alert" ? "Alerte"
             : "Nouvelle lettre reçue",
        description: t === "package" ? "Colis en attente de récupération"
                   : t === "alert" ? "Veuillez vérifier la boîte"
                   : "Courrier standard déposé dans la boîte aux lettres",
        time: prettyTime(eventDate),
        // ✅ Garde la logique 24h (meilleur UX)
        isNew: (Date.now() - eventDate.getTime()) < 24 * 3600 * 1000,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("[getNotifications] error:", err);
    res.status(500).json({ error: "Erreur lors du chargement des notifications depuis les events" });
  }
};

// POST /api/notifications - Créer un nouvel event (appelé par l'ESP32)
exports.createNotification = async (req, res) => {
  try {
    const { type, timestamp, deviceID } = req.body;

    if (!type || !timestamp || !deviceID) {
      return res.status(400).json({ 
        error: "Champs manquants : { type, timestamp, deviceID }" 
      });
    }

    const event = new Event({
      type,
      timestamp: new Date(timestamp),
      deviceID
    });

    await event.save();

    res.status(201).json({ 
      message: " Event enregistré avec succès", 
      event 
    });
  } catch (err) {
    console.error("Erreur createNotification:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};

// POST /api/notifications/mark-all-read - No-op pour compatibilité frontend
exports.markAllRead = async (req, res) => {
  // Les events n'ont pas de champ "vu", donc on renvoie juste un succès
  res.json({ message: " Toutes les notifications marquées comme lues" });
};

// POST /api/notifications/:id/read - No-op pour compatibilité frontend
exports.markOneRead = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: "Event introuvable" });
    }

    res.json({ message: " Notification marquée comme lue" });
  } catch (err) {
    console.error("Erreur markOneRead:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};

// DELETE /api/notifications/:id - Supprimer un event
exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ error: "Event introuvable" });
    }

    res.json({ message: " Event supprimé" });
  } catch (err) {
    console.error("Erreur deleteOne:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};