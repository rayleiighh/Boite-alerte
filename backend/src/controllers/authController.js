const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Vérifier que l'utilisateur existe
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Identifiants incorrects" });
    }

    // 2. Vérifier le mot de passe avec Argon2
    const isValid = await argon2.verify(user.password, password);

    if (!isValid) {
      return res
        .status(401)
        .json({ message: "Identifiants incorrects" });
    }

    // ✅ Mise à jour de la dernière connexion
    user.lastLogin = new Date();
    await user.save();

    // 3. Générer un JWT valide 2 heures
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // 4. Retourner le token
    res.json({ token });
  } catch (error) {
    console.error("Erreur login :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
