const Event = require("../models/Event");
const Notification = require("../models/Notification"); 
const User = require("../models/User");
const { sendNotificationEmail } = require("../services/mailer");

// GET /api/notifications - Récupère les notifications actives
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ timestamp: -1 })
      .limit(200)
      .lean();

    const formatted = notifications.map(notif => ({
      id: String(notif._id),
      type: notif.type,
      title: notif.title,
      description: notif.description,
      time: prettyTime(notif.timestamp),
      timestamp: notif.timestamp,
      isNew: notif.isNew,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Erreur getNotifications:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /api/notifications - Créer un événement + notification
exports.createNotification = async (req, res) => {
  try {
    const { type, timestamp, deviceID } = req.body;

    if (!type || !timestamp || !deviceID) {
      return res.status(400).json({ 
        error: "Champs manquants : { type, timestamp, deviceID }" 
      });
    }

    // Mapping du type
    const low = (type || "").toLowerCase();
    const notifType = low.includes("colis") ? "package" 
      : low.includes("alerte") ? "alert" 
      : "mail";

    const title = notifType === "package" ? "Colis détecté"
      : notifType === "alert" ? "Alerte système"
      : "Nouvelle lettre reçue";

    const description = notifType === "package"
      ? "Un colis est en attente de récupération."
      : notifType === "alert"
      ? "Veuillez vérifier la boîte aux lettres."
      : "Un courrier a été déposé dans votre boîte.";

    // Créer l'EVENT (pour l'historique - ne jamais supprimer)
    const event = new Event({
      type: notifType,
      timestamp: new Date(timestamp),
      deviceID
    });
    await event.save();
    console.log("Event créé:", event._id);

    //  Créer la NOTIFICATION (pour la page Notifications - peut être supprimée)
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
    console.log("Notification créée:", notification._id);

    //  Envoyer les emails
    const users = await User.find({ active: true }).select("email");
    console.log(` Envoi d'emails à ${users.length} utilisateur(s) inscrit(s)`);

    const whenText = new Date(timestamp).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    users.forEach(user => {
      sendNotificationEmail({
        type: notifType,
        title,
        description,
        when: whenText,
        to: user.email,
      })
        .then(() => console.log(`Email envoyé à ${user.email}`))
        .catch(err => console.error(`Erreur email pour ${user.email}:`, err.message));
    });

    //Broadcast WebSocket (optionnel)
    try {
      const { wss } = require("../server");
      if (wss && wss.broadcast) {
        wss.broadcast({
          id: String(notification._id),
          type: notifType,
          title,
          description,
          time: prettyTime(new Date(timestamp)),
          isNew: true,
        });
      }
    } catch (err) {
      // WebSocket non disponible, pas grave
    }

    res.status(201).json({
      message: " Event et notification enregistrés avec succès",
      event: event._id,
      notification: notification._id,
      emailsSent: users.length,
    });
  } catch (err) {
    console.error("Erreur createNotification:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};

// POST /api/notifications/:id/read - Marquer comme lu
exports.markOneRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isNew: false },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification non trouvée" });
    }

    res.json({ message: "Notification marquée comme lue" });
  } catch (err) {
    console.error("Erreur markOneRead:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// POST /api/notifications/mark-all-read - Marquer tout comme lu
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ isNew: true }, { isNew: false });
    res.json({ message: " Toutes les notifications ont été marquées comme lues" });
  } catch (err) {
    console.error("Erreur markAllRead:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// DELETE /api/notifications/:id - Supprimer une notification (l'event reste dans l'historique)
exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification non trouvée" });
    }

    // On ne supprime PAS l'event correspondant, il reste dans l'historique !
    res.json({ message: " Notification supprimée (historique conservé)" });
  } catch (err) {
    console.error("Erreur deleteOne:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Helper pour formatter le temps
function prettyTime(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const wasYesterday = d.toDateString() === yesterday.toDateString();

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  if (sameDay) return `${hh}h${mm}`;
  if (wasYesterday) return `Hier ${hh}h${mm}`;
  
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }) + ` ${hh}h${mm}`;
}