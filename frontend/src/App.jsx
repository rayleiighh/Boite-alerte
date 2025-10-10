/***************************************************************************
 *
 *  Project Title : Boite-alerte
 *  Authors       : Nicolas H, Rayane B, ..., ..., ...
 *  File          : App.jsx
 *  Description   : Main App component
 *  Date          : 27/09/2025
 *  Version       : [1.0.0]
 *
 ***************************************************************************/

import { useState } from "react";
import { SideNavigation } from "./components/SideNavigation";
import { BottomNavigation } from "./components/BottomNavigation";
import { Dashboard } from "./pages/Dashboard";
import Notifications from "./pages/Notifications"; // ✅ garde le composant de feature/Notification
import Messages from "./pages/Messages";
<<<<<<< HEAD
import Login from "./pages/Login";
=======
import HistoryPage from "./pages/History";
>>>>>>> origin/developp
import HistoryPage from "./pages/History";
import Login from "./pages/Login";

// ✅ Mock temporaire
const mockNotifications = [
  { id: "1", isNew: true },
  { id: "2", isNew: true },
  { id: "3", isNew: false },
  { id: "4", isNew: false },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications] = useState(mockNotifications);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // ✅ ajouté

  const newNotificationsCount = notifications.filter((n) => n.isNew).length;

  const renderActivePage = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "notifications":
        return (
          <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
            <div style={{ maxWidth: 1120, margin: "0 auto" }}>
              <Notifications />
            </div>
          </div>
        );
      case "messages":
        return <Messages />;
      case "history":
        return <HistoryPage />;
      default:
        return null;
    }
  };

    // ✅ Si l'utilisateur n'est pas connecté, afficher la page Login
  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // ✅ Si connecté, afficher la structure principale
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
      <div className="lg:hidden">
        <div className="max-w-md mx-auto min-h-screen relative backdrop-blur-sm bg-white/80 shadow-2xl shadow-slate-200/50">
          {renderActivePage()}
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
