import { useDashboardData } from "../hooks/useDashboardData";
import { Dashboard } from "./Dashboard";
import { RefreshCw, AlertTriangle, Wifi, WifiOff, Clock } from "lucide-react";
import { Button } from "../components/button";
import { Badge } from "../components/badge";

export function DashboardContainer() {
  const {
    mailboxStatus,
    lastActivity,
    loading,
    error,
    connectionStatus,
    refresh,
  } = useDashboardData({
    refreshInterval: 30000, // 30 secondes (Polling conservé en arrière-plan)
    enableWebSocket: false, // WebSocket désactivé
  });

  const handleViewDetails = () => {
    // Navigation vers la page d'historique ou détails
    console.log("Navigating to details page...");
  };

  // Fonction pour obtenir l'icône et le style du statut de connexion (Fonction conservée pour le Loading Screen)
  const getConnectionInfo = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          icon: Wifi,
          text: "Temps réel",
          variant: "default",
          className: "bg-green-100 text-green-700",
        };
      case "disconnected": 
        return {
          icon: Clock,
          text: "Synchronisé", 
          variant: "secondary",
          className: "bg-blue-100 text-blue-700",
        };
      case "error":
      default:
        return {
          icon: WifiOff,
          text: "Hors ligne",
          variant: "destructive",
          className: "bg-red-100 text-red-700",
        };
    }
  };

  const connectionInfo = getConnectionInfo();
  // ConnectionIcon n'est plus utilisé en dehors du bloc 'loading'
  // const ConnectionIcon = connectionInfo.icon; 

  // Écran de chargement (Conserve l'indicateur de chargement)
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header avec indicateur de chargement */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <Badge className={connectionInfo.className}>
              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
              Chargement...
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec bouton refresh */}
      <div className="px-6 pt-6 flex items-center justify-between">
        
        {/* MODIFICATION: La div qui contenait la Badge de connexion est simplifiée */}
        <div className="flex items-center gap-3">
          
          {/* Affichage de l'erreur maintenu */}
          {error && (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Erreur de connexion
            </Badge>
          )}
        </div>
        {/* FIN DE LA MODIFICATION */}

        <Button
          onClick={refresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {/* Dashboard principal */}
      <Dashboard
        mailboxStatus={mailboxStatus}
        lastActivity={lastActivity}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}