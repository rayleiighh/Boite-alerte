const Event = require("../models/Event");

// POST /api/events
exports.addEvent = async (req, res) => {
  try {
    const { type, timestamp, deviceID } = req.body;

    // Validation simple (au cas où Joi n’est pas encore mis en place)
    if (!type || !timestamp || !deviceID) {
      return res.status(400).json({ error: "Champs manquants : { type, timestamp, deviceID }" });
    }

    const event = new Event({
      type,
      timestamp: new Date(timestamp), // s’assure que c’est une date
      deviceID
    });

    await event.save();

    res.status(200).json({ message: "✅ Event enregistré avec succès", event });
  } catch (err) {
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};
