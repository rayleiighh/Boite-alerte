const Notification = require("../models/Notification");

// GET /api/notifications - Récupérer toutes les notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ timestamp: -1 }) // Plus récent en premier
      .limit(100); // Limite à 100 notifications

    // Formatter pour le frontend
    const formatted = notifications.map(n => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      description: n.description,
      time: new Date(n.timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isNew: n.isNew
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Erreur getNotifications:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};

// POST /api/notifications - Créer une nouvelle notification
exports.createNotification = async (req, res) => {
  try {
    const { type, title, description, deviceID } = req.body;

    if (!type || !title || !description || !deviceID) {
      return res.status(400).json({ 
        error: "Champs manquants : { type, title, description, deviceID }" 
      });
    }

    const notification = new Notification({
      type,
      title,
      description,
      deviceID,
      isNew: true
    });

    await notification.save();

    res.status(201).json({ 
      message: "✅ Notification créée avec succès", 
      notification 
    });
  } catch (err) {
    console.error("Erreur createNotification:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};

// POST /api/notifications/mark-all-read - Marquer toutes comme lues
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ isNew: true }, { isNew: false });
    res.json({ message: "✅ Toutes les notifications marquées comme lues" });
  } catch (err) {
    console.error("Erreur markAllRead:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};

// POST /api/notifications/:id/read - Marquer une notification comme lue
exports.markOneRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isNew: false },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification introuvable" });
    }

    res.json({ message: "✅ Notification marquée comme lue", notification });
  } catch (err) {
    console.error("Erreur markOneRead:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};

// DELETE /api/notifications/:id - Supprimer une notification
exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ error: "Notification introuvable" });
    }

    res.json({ message: "✅ Notification supprimée" });
  } catch (err) {
    console.error("Erreur deleteOne:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};