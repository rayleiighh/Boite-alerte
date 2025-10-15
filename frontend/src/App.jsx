/***************************************************************************
 *
 *  Project Title : Boite-alerte
 *  Authors       : Nicolas H, Rayane B, Saad Z, ..., ...
 *  File          : App.jsx
 *  Description   : Main App component
 *  Date          : 27/09/2025
 *  Version       : [1.0.0]
 *
 ***************************************************************************/

import { useState, useEffect } from "react";
import { SideNavigation } from "./components/SideNavigation";
import { BottomNavigation } from "./components/BottomNavigation";
import { DashboardContainer } from "./pages/DashboardContainer";
import Notifications from "./pages/Notifications"; // ✅ import par défaut
import { MessageSetup } from "./pages/MessageSetup";
import { HistoryPage } from "./pages/History";
import { getNotifications } from "./services/notifications.api.js"; // ✅ vrai service API

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);

  // 🔁 Charge les notifications depuis l'API au démarrage et toutes les 10 secondes
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Erreur lors du chargement des notifications:", error);
      }
    };

    loadNotifications(); // initial
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🔢 Compte uniquement les notifications non lues
  const newNotificationsCount = notifications.filter((n) => n.isNew).length;

  const renderActivePage = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContainer />;
      case "notifications":
        return <Notifications />;
      case "messages":
        return <MessageSetup />;
      case "history":
        return <HistoryPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        <SideNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          notificationCount={newNotificationsCount}
        />
        <div className="flex-1 overflow-auto">{renderActivePage()}</div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen">
        <div className="mobile-content">{renderActivePage()}</div>

        {/* Navigation fixe en bas */}
        <div className="bottom-nav-container">
          <BottomNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            notificationCount={newNotificationsCount}
          />
        </div>
      </div>
    </div>
  );
}
