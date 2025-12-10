/***************************************************************************
 *
 * Project Title : Boite-alerte
 * Authors       : Nicolas H, Rayane B, Saad Z,  Mohamed EM, ...
 * File          : App.jsx
 * Description   : Main App component
 * Date          : 27/09/2025
 * Version       : [1.0.0]
 *
 ***************************************************************************/

import { useState, useEffect } from "react";
import { SideNavigation } from "./components/SideNavigation";
import { BottomNavigation } from "./components/BottomNavigation";
import { DashboardContainer } from "./pages/DashboardContainer";
import Notifications from "./pages/Notifications";
import { MessageSetup } from "./pages/MessageSetup";
import HistoryPage from "./pages/History";
import { getNotifications } from "./services/notifications.api.js";
import Login from "./pages/Login";

export default function App() {

  // ✅ (1) ÉTAT DE CONNEXION AVEC PERSISTANCE
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem("authToken");
    return !!token;
  });

  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);

  // ✅ (2) FONCTION LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // supprime le JWT
    setIsLoggedIn(false);                 // retourne au Login
  };

  // 🔁 Charge les notifications depuis l'API
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Erreur lors du chargement des notifications:", error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

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

  // ✅ (3) SI PAS CONNECTÉ → LOGIN
  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        <SideNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          notificationCount={newNotificationsCount}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 overflow-auto">
          {renderActivePage()}
        </div>
      </div>
  
      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen">
        <div className="mobile-content">{renderActivePage()}</div>
  
        <div className="bottom-nav-container">
          <BottomNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            notificationCount={newNotificationsCount}
           onLogout={handleLogout}
          />
        </div>
      </div>
    </div>
  );
}
