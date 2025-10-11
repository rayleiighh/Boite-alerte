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
import { DashboardContainer } from "./pages/DashboardContainer";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import HistoryPage from "./pages/History";

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

  const newNotificationsCount = notifications.filter((n) => n.isNew).length;

  const renderActivePage = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContainer />;
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
