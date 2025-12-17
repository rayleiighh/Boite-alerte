const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const MainUser = require("../models/MainUser");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Vérification des champs
    if (!username || !password) {
      return res.status(400).json({
        message: "Nom d'utilisateur et mot de passe requis",
      });
    }

    // 2. Rechercher l'admin
    const user = await MainUser.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Identifiants incorrects",
      });
    }

    // 3. Vérifier le mot de passe
    const isValid = await argon2.verify(user.password, password);

    if (!isValid) {
      return res.status(401).json({
        message: "Identifiants incorrects",
      });
    }

    // 4. Mettre à jour la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // 5. Générer le JWT
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // 6. Réponse
    res.json({ token });
  } catch (error) {
    console.error("❌ Erreur login :", error);
    res.status(500).json({
      message: "Erreur serveur",
    });
  }
}

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
    }

    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      return res.status(400).json({
        message: "Mot de passe trop faible (8 caractères minimum, 1 chiffre)",
      });
    }

    // 🔐 Utilisateur injecté par authJwt
    const user = await MainUser.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Vérification ancien mot de passe
    const isValid = await argon2.verify(user.password, currentPassword);
    if (!isValid) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect" });
    }

    // Hash nouveau mot de passe
    const newHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });

    // 🔴 POINT CLÉ
    user.password = newHash;
    user.lastPasswordChange = new Date();
    await user.save();

    // ❌ PAS DE JWT ICI
    return res.status(200).json({
      message: "Mot de passe modifié. Reconnexion requise.",
    });

  } catch (err) {
    console.error("Erreur changePassword:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};