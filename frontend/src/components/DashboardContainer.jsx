import { useDashboardData } from "../hooks/useDashboardData";
import { Dashboard } from "./Dashboard";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "../components/button";

export function DashboardContainer() {
  const { mailboxStatus, lastActivity, loading, error, refresh } =
    useDashboardData(30000); // Refresh toutes les 30 secondes

  const handleViewDetails = () => {
    // Navigation vers la page d'historique ou détails
    console.log("Navigating to details page...");
  };

  // Écran de chargement
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Écran d'erreur avec possibilité de retry
  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-sm">
          <AlertTriangle className="w-8 h-8 mx-auto text-red-500" />
          <p className="text-muted-foreground">Erreur de connexion</p>
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Dashboard
      mailboxStatus={mailboxStatus}
      lastActivity={lastActivity}
      onViewDetails={handleViewDetails}
    />
  );
}
