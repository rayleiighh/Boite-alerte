import { useState } from "react";
import { Weight, Wifi, Zap, Battery, Activity } from "lucide-react";

export default function EventItemRow({ e }) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (d) =>
    new Date(d).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ========== Formatage stats enrichies ==========
  
  const getWifiQuality = (rssi) => {
    if (!rssi) return { label: "N/A", color: "text-slate-400" };
    if (rssi >= -50) return { label: "Excellent", color: "text-green-600" };
    if (rssi >= -60) return { label: "Très bon", color: "text-green-500" };
    if (rssi >= -70) return { label: "Bon", color: "text-yellow-500" };
    if (rssi >= -80) return { label: "Faible", color: "text-orange-500" };
    return { label: "Très faible", color: "text-red-500" };
  };

  const formatUptime = (seconds) => {
    if (seconds === null || seconds === undefined) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}min`;
    return `${mins}min`;
  };

  const hasEnrichedData = 
    e.weight_g !== null || 
    e.rssi !== null || 
    e.uptime_s !== null || 
    e.event_count !== null;

  const wifiQuality = getWifiQuality(e.rssi);

  return (
    <>
      <tr 
        className="hover:bg-slate-50 transition cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3 px-4">
          <span className="inline-block px-3 py-1 text-sm font-medium text-slate-700 bg-slate-100 rounded-full">
            {e.type}
          </span>
        </td>
        <td className="py-3 px-4">{formatDate(e.timestamp)}</td>
        <td className="py-3 px-4">{e.deviceID || "—"}</td>
      </tr>

      {/* Ligne détails expandables */}
      {expanded && hasEnrichedData && (
        <tr className="bg-slate-50">
          <td colSpan="3" className="py-4 px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              
              {/* Poids */}
              {e.weight_g !== null && (
                <div className="flex items-start gap-2">
                  <Weight className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500">Poids</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {e.weight_g.toFixed(2)} g
                    </div>
                  </div>
                </div>
              )}

              {/* WiFi Signal */}
              {e.rssi !== null && (
                <div className="flex items-start gap-2">
                  <Wifi className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500">WiFi Signal</div>
                    <div className={`text-sm font-semibold ${wifiQuality.color}`}>
                      {e.rssi} dBm
                    </div>
                    <div className="text-xs text-slate-500">{wifiQuality.label}</div>
                  </div>
                </div>
              )}

              {/* Uptime */}
              {e.uptime_s !== null && (
                <div className="flex items-start gap-2">
                  <Activity className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500">Uptime</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {formatUptime(e.uptime_s)}
                    </div>
                  </div>
                </div>
              )}

              {/* Event Count */}
              {e.event_count !== null && (
                <div className="flex items-start gap-2">
                  <Zap className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500">Event #</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {e.event_count}
                    </div>
                  </div>
                </div>
              )}

              {/* État IR Beam */}
              {e.beam_state !== null && (
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded-full mt-0.5 ${e.beam_state ? 'bg-red-500' : 'bg-green-500'}`} />
                  <div>
                    <div className="text-xs text-slate-500">IR Beam</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {e.beam_state ? "Bloqué" : "Libre"}
                    </div>
                  </div>
                </div>
              )}

              {/* Batterie */}
              {e.battery_percent !== null && (
                <div className="flex items-start gap-2">
                  <Battery className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <div className="text-xs text-slate-500">Batterie</div>
                    <div className="text-sm font-semibold text-slate-700">
                      {e.battery_percent}%
                    </div>
                  </div>
                </div>
              )}

            </div>
          </td>
        </tr>
      )}
    </>
  );
}