const DisplayConfig = require("../models/DisplayConfig");

// ========== GET /api/display?deviceID=xxx ==========
exports.getDisplayConfig = async (req, res) => {
  try {
    const { deviceID } = req.query;

    if (!deviceID) {
      return res.status(400).json({ 
        error: "Paramètre deviceID manquant" 
      });
    }

    // Chercher la config pour ce device
    let config = await DisplayConfig.findOne({ deviceID });

    // Si pas de config, créer une config par défaut
    if (!config) {
      config = new DisplayConfig({
        deviceID,
        houseNumber: "86B",
        message: "NO PUB",
      });
      await config.save();
      console.log(`📺 [DISPLAY] Config créée pour ${deviceID}`);
    }

    res.json({
      deviceID: config.deviceID,
      houseNumber: config.houseNumber,
      message: config.message,
      updatedAt: config.updatedAt,
    });

  } catch (err) {
    console.error("❌ [ERROR] getDisplayConfig:", err.message);
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};

// ========== PUT /api/display ==========
exports.updateDisplayConfig = async (req, res) => {
  try {
    const { deviceID, houseNumber, message } = req.body;

    // Validation
    if (!deviceID) {
      return res.status(400).json({ 
        error: "Champ deviceID manquant" 
      });
    }

    if (!houseNumber && !message) {
      return res.status(400).json({ 
        error: "Au moins un champ (houseNumber ou message) requis" 
      });
    }

    // Préparer les champs à mettre à jour
    const updateFields = {};
    if (houseNumber !== undefined) updateFields.houseNumber = houseNumber;
    if (message !== undefined) updateFields.message = message;

    // Mise à jour ou création (upsert)
    const config = await DisplayConfig.findOneAndUpdate(
      { deviceID },
      updateFields,
      { 
        new: true,
        upsert: true,
        runValidators: true 
      }
    );

    console.log(`📺 [DISPLAY] Config mise à jour pour ${deviceID}:`, updateFields);

    res.json({
      message: "✅ Configuration mise à jour",
      config: {
        deviceID: config.deviceID,
        houseNumber: config.houseNumber,
        message: config.message,
        updatedAt: config.updatedAt,
      },
    });

  } catch (err) {
    console.error("❌ [ERROR] updateDisplayConfig:", err.message);
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};

// ========== GET /api/display/all ==========
exports.getAllDisplayConfigs = async (req, res) => {
  try {
    const configs = await DisplayConfig.find().sort({ updatedAt: -1 });

    res.json({
      total: configs.length,
      configs,
    });

  } catch (err) {
    console.error("❌ [ERROR] getAllDisplayConfigs:", err.message);
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};