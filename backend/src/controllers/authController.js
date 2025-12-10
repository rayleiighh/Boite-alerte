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
