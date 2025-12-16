const User = require("../models/User");

// POST /api/users/subscribe - S'inscrire pour recevoir les notifications
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Email invalide" });
    }

    // Vérifie si l'email existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      // Réactive si l'utilisateur était désactivé
      if (!existingUser.active) {
        existingUser.active = true;
        await existingUser.save();
        return res.json({ 
          message: "✅ Notifications réactivées pour cet email", 
          user: existingUser 
        });
      }
      return res.status(409).json({ error: "Cet email est déjà inscrit" });
    }

    // Crée un nouvel utilisateur
    const user = new User({ email: email.toLowerCase() });
    await user.save();

    res.status(201).json({ 
      message: "✅ Inscription réussie ! Vous recevrez les notifications par email", 
      user 
    });
  } catch (err) {
    console.error("Erreur subscribe:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};

// POST /api/users/unsubscribe - Se désinscrire
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: "Email non trouvé" });
    }

    user.active = false;
    await user.save();

    res.json({ message: "✅ Désinscription réussie" });
  } catch (err) {
    console.error("Erreur unsubscribe:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};

// GET /api/users - Liste des utilisateurs inscrits (admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ active: true }).select("email createdAt");
    res.json({ count: users.length, users });
  } catch (err) {
    console.error("Erreur getUsers:", err);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};


// Récupérer tous les utilisateurs avec notifications actives
exports.getNotifiedEmails = async (req, res) => {
  try {
    const users = await User.find({ active: true }).select(
      "username email active"
    );

    const emails = users.map(u => u.email); // ✅ recalculé AU BON ENDROIT

    res.json(emails); // ✅ on retourne un tableau d'emails

  } catch (error) {
    console.error("Erreur récupération emails notifiés:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

