import { useState, useEffect, useCallback, useRef } from "react";
// Importation des nouvelles fonctions
import {
  fetchLatestEvent,
  fetchHeartbeatStatus,
  fetchEventSummary,
} from "../services/events";

// Importation pour le formatage des dates
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";

const API_BASE = (
  import.meta?.env?.VITE_API_BASE || "http://localhost:4000"
).replace(/\/$/, "");

export function useDashboardData(options = {}) {
  const {
    refreshInterval = 30000, // 30 secondes par défaut
    enableWebSocket = false,
    deviceID = "esp32-mailbox-001" // Ajout du deviceID par défaut
  } = options;

  const [data, setData] = useState({
    // Statut de l'événement (boîte aux lettres)
    mailboxStatus: "unknown",
    lastActivity: "Chargement...",
    // Statut du Heartbeat (connexion ESP32)
    deviceOnline: false,
    // Données des graphiques (Mocks temporaires jusqu'à l'implémentation du backend)
    weeklyData: [],
    monthlyData: [],
    weeklyTotalMail: 0,
    weeklyTotalPackage: 0,
    monthlyTotal: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const wsRef = useRef(null);
  const intervalRef = useRef(null);

  // Fonction de formatage pour la dernière activité
  const formatLastActivity = useCallback((eventTimestamp, fallbackMessage) => {
    if (!eventTimestamp) return fallbackMessage;
    
    const lastDate = new Date(eventTimestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastDate.getTime()) / (1000 * 60);
    
    // Si < 60 minutes, utilise 'Il y a X minutes/secondes'
    if (diffInMinutes < 60) {
      return `Il y a ${formatDistanceToNow(lastDate, { addSuffix: true, locale: fr })}`;
    }
    // Sinon, utilise le format complet
    return format(lastDate, "dd MMMM yyyy à HH:mm", { locale: fr });
  }, []);


  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      
      // --- 1. Fetch de l'état de la boîte (Event) ---
      const latestEventData = await fetchLatestEvent();
      
      // --- 2. Fetch de l'état de l'appareil (Heartbeat) ---
      const heartbeatData = await fetchHeartbeatStatus(deviceID);
      
      // --- 3. Fetch des données de résumé pour les charts ---
      const summaryData = await fetchEventSummary();
      
      // --- Combinaison et formatage des données ---
      
      // a) Statut de la boîte (du Event Controller)
      const mailboxStatus = latestEventData.status || "empty";
      
      // b) Message/Dernière activité (du Event Controller ou Heartbeat)
      let lastActivity;
      if (latestEventData.hasEvent) {
          // Utilise le timestamp réel de l'événement pour la dernière activité
          lastActivity = formatLastActivity(latestEventData.lastEvent.timestamp, latestEventData.message);
      } else if (heartbeatData.lastSeen) {
          // Si pas d'événement, utilise la dernière vue de l'appareil
          lastActivity = `Appareil vu ${formatLastActivity(heartbeatData.lastSeen, heartbeatData.message)}`;
      } else {
          lastActivity = latestEventData.message; // Message par défaut ou d'erreur
      }
      
      // c) État de l'appareil (du Heartbeat Controller)
      const deviceOnline = heartbeatData.connected || false;

      setData({
        mailboxStatus,
        lastActivity,
        deviceOnline,
        // Données agrégées pour les graphiques
        weeklyData: summaryData.weeklyData || [],
        monthlyData: summaryData.monthlyData || [],
        weeklyTotalMail: summaryData.weeklyTotalMail || 0,
        weeklyTotalPackage: summaryData.weeklyTotalPackage || 0,
        monthlyTotal: summaryData.monthlyTotal || 0,
      });

      // Met à jour le statut de connexion du hook principal (pour le Badge du Container)
      setConnectionStatus(deviceOnline ? "connected" : "disconnected");

    } catch (err) {
      setError(err.message || "Erreur lors du chargement des données");
      console.error("Erreur lors du chargement des données du dashboard:", err);

      setData(prev => ({
        ...prev, // Conserve les données des charts si elles ont été chargées
        mailboxStatus: "error", // Utiliser un statut pour afficher l'erreur
        lastActivity: "Erreur de connexion - Vérifiez le backend.",
        deviceOnline: false,
      }));
      setConnectionStatus("error"); // Affiche l'erreur de connexion dans le Container
    } finally {
      setLoading(false);
    }
  }, [deviceID, formatLastActivity]);
  
  // Reste du code du hook inchangé (WebSocket/Polling/Cleanup)
  
  // WebSocket pour les mises à jour en temps réel (Inchangé)
  const initWebSocket = useCallback(() => {
    // ... (Logique WebSocket inchangée) ...
  }, [enableWebSocket]);

  // Polling comme fallback
  const startPolling = useCallback(() => {
    if (!refreshInterval) return;

    intervalRef.current = setInterval(() => {
      loadDashboardData(); // Utilisez la nouvelle fonction
    }, refreshInterval);
  }, [loadDashboardData, refreshInterval]);

  // Charger les données au montage du composant
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
    loadDashboardData();
  }, [loadDashboardData]);

  // Rendu des données
  return {
    ...data, // Retourne toutes les données (status, lastActivity, charts data)
    loading,
    error,
    connectionStatus,
    refresh,
  };
}