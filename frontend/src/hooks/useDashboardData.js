import { useState, useEffect, useCallback, useRef } from "react";
import { fetchLatestEvent } from "../services/events";

const API_BASE = (
  import.meta?.env?.VITE_API_BASE || "http://localhost:4000"
).replace(/\/$/, "");

export function useDashboardData(options = {}) {
  const {
    refreshInterval = 30000, // 30 secondes par défaut
    enableWebSocket = false, // WebSocket désactivé par défaut (pas encore implémenté côté backend)
  } = options;

  const [data, setData] = useState({
    status: "empty",
    message: "Chargement...",
    lastEvent: null,
    hasEvent: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const wsRef = useRef(null);
  const intervalRef = useRef(null);

  const loadLatestEvent = useCallback(async () => {
    try {
      setError(null);
      const latestData = await fetchLatestEvent();
      setData(latestData);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des données");
      console.error("Erreur lors du chargement du dernier événement:", err);

      // En cas d'erreur, afficher un état par défaut
      setData({
        status: "empty",
        message: "Erreur de connexion - Impossible de récupérer les données",
        lastEvent: null,
        hasEvent: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // WebSocket pour les mises à jour en temps réel
  const initWebSocket = useCallback(() => {
    if (!enableWebSocket) {
      setConnectionStatus("disconnected");
      return;
    }

    try {
      const wsUrl =
        (API_BASE.startsWith("https") ? "wss://" : "ws://") +
        API_BASE.replace(/^https?:\/\//, "") +
        "/ws/dashboard";

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.addEventListener("open", () => {
        setConnectionStatus("connected");
        console.log("✅ WebSocket dashboard connecté");
      });

      ws.addEventListener("close", () => {
        setConnectionStatus("disconnected");
        console.log("⚠️ WebSocket dashboard fermé - Basculement sur polling");
      });

      ws.addEventListener("error", () => {
        setConnectionStatus("disconnected");
        // Ne plus logger l'erreur car c'est attendu si WebSocket n'est pas implémenté
      });

      ws.addEventListener("message", (event) => {
        try {
          const wsData = JSON.parse(event.data);
          if (wsData.type === "dashboard_update") {
            setData(wsData.data);
          }
        } catch (err) {
          console.error("Erreur parsing message WebSocket:", err);
        }
      });
    } catch {
      setConnectionStatus("disconnected");
      // Erreur silencieuse - le polling prendra le relais
    }
  }, [enableWebSocket]);

  // Polling comme fallback
  const startPolling = useCallback(() => {
    if (!refreshInterval) return;

    intervalRef.current = setInterval(() => {
      loadLatestEvent();
    }, refreshInterval);
  }, [loadLatestEvent, refreshInterval]);

  // Charger les données au montage du composant
  useEffect(() => {
    loadLatestEvent();
  }, [loadLatestEvent]);

  // Initialiser WebSocket ou polling
  useEffect(() => {
    if (enableWebSocket) {
      initWebSocket();
    }

    // Toujours démarrer le polling comme fallback
    startPolling();

    return () => {
      // Cleanup
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enableWebSocket, initWebSocket, startPolling]);

  // Fonction pour forcer un refresh manuel
  const refresh = useCallback(() => {
    setLoading(true);
    loadLatestEvent();
  }, [loadLatestEvent]);

  // Fonction pour mapper le status de l'API vers le format attendu par le Dashboard
  const getMailboxStatus = () => {
    switch (data.status) {
      case "mail":
        return "mail";
      case "package":
        return "package";
      case "empty":
      default:
        return "empty";
    }
  };

  return {
    mailboxStatus: getMailboxStatus(),
    lastActivity: data.message,
    lastEvent: data.lastEvent,
    loading,
    error,
    connectionStatus,
    refresh,
  };
}
