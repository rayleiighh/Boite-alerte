import { useState, useEffect } from "react";
import { Wifi, WifiOff, Activity, Battery, Weight } from "lucide-react";

export default function DeviceStatus({ deviceID = "esp32-mailbox-001" }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Polling toutes les 10s
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const response = await fetch(
          `${API_URL}/api/heartbeat/latest?deviceID=${deviceID}`,
          {
            headers: {
              "X-API-Key": import.meta.env.VITE_API_KEY || "dev-local-key",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error("Erreur fetch status:", error);
        setStatus({ connected: false });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Toutes les 10s

    return () => clearInterval(interval);
  }, [deviceID]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <div className="w-2 h-2 bg-slate-300 rounded-full animate-pulse" />
        <span className="text-sm">Vérification connexion...</span>
      </div>
    );
  }

  const isConnected = status?.connected;
  const heartbeat = status?.heartbeat;
  const ageSeconds = status?.ageSeconds || 0;

  // Formatage uptime
  const formatUptime = (seconds) => {
    if (!seconds) return "—";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}min`;
    return `${mins}min`;
  };

  // Qualité WiFi
  const getWifiQuality = (rssi) => {
    if (!rssi) return { label: "N/A", color: "text-slate-400" };
    if (rssi >= -50) return { label: "Excellent", color: "text-green-600" };
    if (rssi >= -60) return { label: "Très bon", color: "text-green-500" };
    if (rssi >= -70) return { label: "Bon", color: "text-yellow-500" };
    return { label: "Faible", color: "text-orange-500" };
  };

  const wifiQuality = getWifiQuality(heartbeat?.rssi);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-slate-200">
      {/* Header - État connexion */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <div className="relative">
                <Wifi className="w-6 h-6 text-green-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">ESP32 Connecté</div>
                <div className="text-xs text-slate-500">
                  Dernière activité : il y a {ageSeconds}s
                </div>
              </div>
            </>
          ) : (
            <>
              <WifiOff className="w-6 h-6 text-red-500" />
              <div>
                <div className="font-semibold text-slate-800">ESP32 Déconnecté</div>
                <div className="text-xs text-slate-500">Aucun heartbeat reçu</div>
              </div>
            </>
          )}
        </div>

        {/* Device ID badge */}
        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded-full">
          {deviceID}
        </span>
      </div>

      {/* Stats système (si connecté) */}
      {isConnected && heartbeat && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
          
          {/* Uptime */}
          <div className="flex items-start gap-2">
            <Activity className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <div className="text-xs text-slate-500">Uptime</div>
              <div className="text-sm font-semibold text-slate-700">
                {formatUptime(heartbeat.uptime_s)}
              </div>
            </div>
          </div>

          {/* WiFi Signal */}
          <div className="flex items-start gap-2">
            <Wifi className={`w-5 h-5 mt-0.5 ${wifiQuality.color}`} />
            <div>
              <div className="text-xs text-slate-500">WiFi</div>
              <div className={`text-sm font-semibold ${wifiQuality.color}`}>
                {heartbeat.rssi} dBm
              </div>
              <div className="text-xs text-slate-500">{wifiQuality.label}</div>
            </div>
          </div>

          {/* Events total */}
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 mt-0.5 rounded bg-purple-100 flex items-center justify-center">
              <span className="text-xs font-bold text-purple-600">#</span>
            </div>
            <div>
              <div className="text-xs text-slate-500">Events</div>
              <div className="text-sm font-semibold text-slate-700">
                {heartbeat.event_count}
              </div>
            </div>
          </div>

          {/* Batterie */}
          <div className="flex items-start gap-2">
            <Battery 
              className={`w-5 h-5 mt-0.5 ${
                heartbeat.battery_percent 
                  ? heartbeat.battery_percent > 50 
                    ? 'text-green-500' 
                    : 'text-orange-500'
                  : 'text-slate-400'
              }`} 
            />
            <div>
              <div className="text-xs text-slate-500">Batterie</div>
              <div className="text-sm font-semibold text-slate-700">
                {heartbeat.battery_percent !== null ? `${heartbeat.battery_percent}%` : "N/A"}
              </div>
            </div>
          </div>

          {/* Poids actuel (colonne complète si disponible) */}
          {heartbeat.weight_g !== null && (
            <div className="flex items-start gap-2 col-span-2 md:col-span-4">
              <Weight className="w-5 h-5 text-slate-600 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500">Poids actuel (balance)</div>
                <div className="text-sm font-semibold text-slate-700">
                  {heartbeat.weight_g.toFixed(3)} g
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    {heartbeat.beam_state ? "• IR bloqué" : "• IR libre"}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}