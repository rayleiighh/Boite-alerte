// ========== HEARTBEAT CONTROLLER (Phase 1) ==========
// Gère les heartbeats périodiques de l'ESP32 pour monitoring

// Stockage en mémoire des derniers heartbeats (limite 100)
const heartbeatHistory = [];
const MAX_HISTORY = 100;

// ========== POST /api/heartbeat ==========
exports.receiveHeartbeat = async (req, res) => {
  try {
    const {
      deviceID,
      timestamp,
      uptime_s,
      event_count,
      battery_percent,
      rssi,
      weight_g,
      beam_state
    } = req.body;

    // Validation
    if (!deviceID || !timestamp) {
      return res.status(400).json({
        error: "Champs manquants : { deviceID, timestamp }"
      });
    }

    // Créer heartbeat entry
    const heartbeat = {
      deviceID,
      timestamp: new Date(timestamp),
      uptime_s: uptime_s || 0,
      event_count: event_count || 0,
      battery_percent: battery_percent || null,
      rssi: rssi || null,
      weight_g: weight_g || null,
      beam_state: beam_state !== undefined ? beam_state : null,
      receivedAt: new Date()
    };

    // Ajouter à l'historique (limite 100 derniers)
    heartbeatHistory.unshift(heartbeat);
    if (heartbeatHistory.length > MAX_HISTORY) {
      heartbeatHistory.pop();
    }

    // Logging console
    const localTime = new Date(timestamp).toLocaleString("fr-BE", {
      timeZone: "Europe/Brussels",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    console.log("💓 [HEARTBEAT] ====================================");
    console.log(`  Device         : ${deviceID}`);
    console.log(`  Time           : ${localTime} (Brussels)`);
    console.log(`  Uptime         : ${uptime_s !== null && uptime_s !== undefined ? Math.floor(uptime_s / 60) + 'min ' + (uptime_s % 60) + 's' : 'N/A'}`);
    console.log(`  Events total   : ${event_count !== null && event_count !== undefined ? event_count : 'N/A'}`);
    console.log(`  WiFi Signal    : ${rssi !== null && rssi !== undefined ? rssi + ' dBm' : 'N/A'}`);
    console.log(`  Weight         : ${weight_g !== null && weight_g !== undefined ? weight_g.toFixed(3) + 'g' : 'N/A'}`);
    console.log(`  IR Beam        : ${beam_state !== null && beam_state !== undefined ? (beam_state ? 'BLOCKED' : 'FREE') : 'N/A'}`);
    console.log(`  Battery        : ${battery_percent !== null && battery_percent !== undefined ? battery_percent + '%' : 'N/A'}`);
    console.log("================================================");

    res.status(200).json({
      success: true,
      message: "💓 Heartbeat reçu",
      timestamp: new Date()
    });

  } catch (err) {
    console.error("❌ [ERROR] receiveHeartbeat:", err.message);
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};

// ========== GET /api/heartbeat/latest ==========
// Retourne le dernier heartbeat reçu pour un device
exports.getLatestHeartbeat = async (req, res) => {
  try {
    const { deviceID } = req.query;

    if (!deviceID) {
      return res.status(400).json({
        error: "Paramètre manquant : deviceID"
      });
    }

    // Chercher le dernier heartbeat pour ce device
    const latest = heartbeatHistory.find(h => h.deviceID === deviceID);

    if (!latest) {
      return res.json({
        connected: false,
        message: "Aucun heartbeat reçu",
        lastSeen: null
      });
    }

    // Vérifier si récent (< 60s = connecté)
    const now = Date.now();
    const lastSeenMs = new Date(latest.receivedAt).getTime();
    const ageSeconds = Math.floor((now - lastSeenMs) / 1000);
    const isConnected = ageSeconds < 60;

    res.json({
      connected: isConnected,
      lastSeen: latest.receivedAt,
      ageSeconds,
      heartbeat: {
        deviceID: latest.deviceID,
        timestamp: latest.timestamp,
        uptime_s: latest.uptime_s,
        event_count: latest.event_count,
        battery_percent: latest.battery_percent,
        rssi: latest.rssi,
        weight_g: latest.weight_g,
        beam_state: latest.beam_state
      }
    });

  } catch (err) {
    console.error("❌ [ERROR] getLatestHeartbeat:", err.message);
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};

// ========== GET /api/heartbeat/history ==========
// Retourne l'historique des heartbeats (max 100 derniers)
exports.getHeartbeatHistory = async (req, res) => {
  try {
    const { deviceID, limit } = req.query;
    
    let history = heartbeatHistory;
    
    // Filtrer par deviceID si fourni
    if (deviceID) {
      history = history.filter(h => h.deviceID === deviceID);
    }
    
    // Limiter le nombre de résultats
    const maxResults = Math.min(parseInt(limit) || 20, 100);
    history = history.slice(0, maxResults);
    
    res.json({
      total: history.length,
      heartbeats: history
    });
    
  } catch (err) {
    console.error("❌ [ERROR] getHeartbeatHistory:", err.message);
    res.status(500).json({ error: "❌ Erreur serveur : " + err.message });
  }
};