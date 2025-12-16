import { useState, useEffect } from "react";
import { Wifi, WifiOff, Activity, Weight, AlertTriangle } from "lucide-react";
import { Card } from "./card";
import { motion } from "framer-motion";

export default function DeviceStatus({ deviceID = "esp32-mailbox-001" }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const API_KEY = import.meta.env.VITE_API_KEY || "dev-local-key";
        
        const response = await fetch(
          `${API_URL}/api/heartbeat/latest?deviceID=${deviceID}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": API_KEY
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        } else {
          console.error("Erreur API heartbeat:", response.status);
          setStatus({ connected: false });
        }
      } catch (error) {
        console.error("Erreur fetch status:", error);
        setStatus({ connected: false });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [deviceID]);

  if (loading) {
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-3 h-3 bg-slate-300 rounded-full animate-pulse" />
          <span className="text-sm">Vérification connexion ESP32...</span>
        </div>
      </Card>
    );
  }

  const ageSeconds = status?.ageSeconds || 0;
  const heartbeat = status?.heartbeat;

  // États de connexion
  const isConnected = status?.connected && ageSeconds < 60;
  const isWarning = ageSeconds >= 60 && ageSeconds < 300;
  const isDisconnected = ageSeconds >= 300 || !status?.connected;

  // Helpers
  const formatUptime = (seconds) => {
    if (!seconds) return "—";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}min`;
    return `${mins}min`;
  };

  const getWifiQuality = (rssi) => {
    if (!rssi) return { label: "N/A", color: "text-slate-400" };
    if (rssi >= -50) return { label: "Excellent", color: "text-green-600" };
    if (rssi >= -60) return { label: "Très bon", color: "text-green-500" };
    if (rssi >= -70) return { label: "Bon", color: "text-yellow-500" };
    return { label: "Faible", color: "text-orange-500" };
  };

  const formatLastSeen = (seconds) => {
    if (seconds < 60) return `il y a ${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `il y a ${mins}min`;
    const hours = Math.floor(mins / 60);
    return `il y a ${hours}h`;
  };

  const wifiQuality = getWifiQuality(heartbeat?.rssi);

  // Classe Card selon l'état
  // LIGNE 104-108
const cardClass = "p-6 bg-white border-0 shadow-lg";

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cardClass}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Connecté */}
            {isConnected && (
              <>
                <motion.div
                  className="relative"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Wifi className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-slate-800">Boite à lettre Connecté</h3>
                  <p className="text-xs text-slate-600">
                    Dernière activité : {formatLastSeen(ageSeconds)}
                  </p>
                </div>
              </>
            )}

            {/* Avertissement */}
            {isWarning && (
              <>
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
                >
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                </motion.div>
                <div>
                  <h3 className="font-semibold text-yellow-800">⚠️ Connexion instable</h3>
                  <p className="text-xs text-yellow-700">
                    Pas de heartbeat depuis {formatLastSeen(ageSeconds)}
                  </p>
                  <p className="text-xs text-yellow-600 mt-0.5">
                    Vérifiez le WiFi ou l'alimentation
                  </p>
                </div>
              </>
            )}

            {/* Déconnecté */}
            {isDisconnected && (
              <>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <WifiOff className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">🔴 ESP32 Déconnecté</h3>
                  <p className="text-xs text-red-700">
                    {status?.lastSeen 
                      ? `Dernière activité : ${formatLastSeen(ageSeconds)}`
                      : "Aucun heartbeat reçu"}
                  </p>
                  <p className="text-xs text-red-600 mt-0.5 font-medium">
                    ⚠️ Problème WiFi, alimentation ou crash
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Device ID Badge */}
          <span className="px-3 py-1.5 bg-white/70 text-slate-700 text-xs font-mono rounded-full shadow-sm">
            {deviceID}
          </span>
        </div>

        {/* Alerte déconnexion */}
        {isDisconnected && (
          <motion.div
            className="mb-4 p-4 bg-red-100/50 border border-red-200 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-2">Actions recommandées :</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Vérifier la connexion WiFi</li>
                  <li>Vérifier l'alimentation / batterie</li>
                  <li>Redémarrer l'ESP32 si nécessaire</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats système */}
        {(isConnected || isWarning) && heartbeat && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            
            {/* Uptime */}
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Uptime</p>
                <p className="text-sm font-semibold text-slate-800">
                  {formatUptime(heartbeat.uptime_s)}
                </p>
              </div>
            </div>

            {/* WiFi */}
            <div className="flex items-start gap-2">
              <div className={`w-10 h-10 rounded-full ${
                wifiQuality.color.includes("green") ? "bg-green-100" :
                wifiQuality.color.includes("yellow") ? "bg-yellow-100" :
                "bg-orange-100"
              } flex items-center justify-center flex-shrink-0`}>
                <Wifi className={`w-5 h-5 ${wifiQuality.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">WiFi</p>
                <p className={`text-sm font-semibold ${wifiQuality.color}`}>
                  {heartbeat.rssi} dBm
                </p>
                <p className="text-xs text-slate-500">{wifiQuality.label}</p>
              </div>
            </div>

            {/* Events */}
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-purple-600">#</span>
              </div>
              <div>
                <p className="text-xs text-slate-500">Events</p>
                <p className="text-sm font-semibold text-slate-800">
                  {heartbeat.event_count}
                </p>
              </div>
            </div>

            

            {/* Poids (si disponible, full width) */}
            {heartbeat.weight_g !== null && heartbeat.weight_g !== undefined && (
              <div className="flex items-start gap-2 col-span-2 md:col-span-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Weight className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Poids actuel</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {heartbeat.weight_g.toFixed(3)} g
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      {heartbeat.beam_state ? "• IR bloqué" : "• IR libre"}
                    </span>
                  </p>
                </div>
              </div>
            )}

          </div>
        )}
      </Card>
    </motion.div>
  );
}
