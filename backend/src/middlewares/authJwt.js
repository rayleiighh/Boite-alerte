const jwt = require("jsonwebtoken");
const MainUser = require("../models/MainUser");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { userId, username, iat, exp }

    const user = await MainUser.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Utilisateur inexistant" });
    }
/*
    // 🔐 INVALIDATION SERVEUR
    if (user.lastPasswordChange) {
      const pwdChangeTimestamp = Math.floor(
        new Date(user.lastPasswordChange).getTime() / 1000
      );

      if (decoded.iat < pwdChangeTimestamp) {
        return res.status(401).json({
          message: "Session expirée, veuillez vous reconnecter",
        });
      }
    }
*/
    req.user = {
      userId: user._id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};
