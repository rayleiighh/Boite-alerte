const Event = require("../models/Event");
const User = require("../models/User"); // ✅ AJOUT
const { sendNotificationEmail } = require("../services/mailer");

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
      .sort({ timestamp: -1, createdAt: -1 })
      .limit(200)
      .lean();

    // Transforme les events en format notifications pour le frontend
    const formatted = events.map(ev => {
      const t = mapType(ev.type);
      const eventDate = new Date(ev.timestamp || ev.createdAt || Date.now());
      
      return {
        id: String(ev._id),
        type: t,
        title: t === "package" ? "Colis détecté"
             : t === "alert" ? "Alerte"
             : "Nouvelle lettre reçue",
        description: t === "package" ? "Colis en attente de récupération"
                   : t === "alert" ? "Veuillez vérifier la boîte"
                   : "Courrier standard déposé dans la boîte aux lettres",
        time: prettyTime(eventDate),
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

    // Crée l'event
    const event = new Event({
      type,
      timestamp: new Date(timestamp),
      deviceID
    });

    await event.save();
    console.log("✅ Event créé:", event._id);

    // ✅ Mapping du type pour l'email
    const low = (type || "").toLowerCase();
    const notifType = low.includes("colis") ? "package" 
      : low.includes("alerte") ? "alert" 
      : "mail";

    const title = notifType === "package" ? "Colis détecté"
      : notifType === "alert" ? "Alerte"
      : "Nouvelle lettre reçue";

    const description = notifType === "package"
      ? "Un colis est en attente de récupération."
      : notifType === "alert"
      ? "Veuillez vérifier la boîte aux lettres."
      : "Un courrier a été déposé dans votre boîte.";

    const whenText = new Date(timestamp).toLocaleString("fr-FR");

    // ✅ Récupère TOUS les utilisateurs actifs
    const users = await User.find({ active: true }).select("email");
    console.log(`📧 Envoi d'emails à ${users.length} utilisateur(s) inscrit(s)`);

    if (users.length === 0) {
      console.log("⚠️ Aucun utilisateur inscrit, aucun email envoyé");
    }

    // ✅ Envoie un email à CHAQUE utilisateur inscrit (non bloquant)
    let emailsSent = 0;
    users.forEach(user => {
      sendNotificationEmail({
        type: notifType,
        title,
        description,
        when: whenText,
        to: user.email // ✅ IMPORTANT : envoie à l'email de l'utilisateur
      })
      .then(() => {
        emailsSent++;
        console.log(`✅ Email envoyé à ${user.email}`);
      })
      .catch(err => {
        console.error(`❌ Erreur email pour ${user.email}:`, err.message);
      });
    });

    res.status(201).json({ 
      message: "✅ Event enregistré avec succès", 
      event,
      emailsSent: users.length
    });
  } catch (err) {
    console.error("Erreur createNotification:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};

// POST /api/notifications/mark-all-read - No-op pour compatibilité frontend
exports.markAllRead = async (req, res) => {
  res.json({ message: "✅ Toutes les notifications marquées comme lues" });
};

// POST /api/notifications/:id/read - No-op pour compatibilité frontend
exports.markOneRead = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ error: "Event introuvable" });
    }

    res.json({ message: "✅ Notification marquée comme lue" });
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

    res.json({ message: "✅ Event supprimé" });
  } catch (err) {
    console.error("Erreur deleteOne:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};