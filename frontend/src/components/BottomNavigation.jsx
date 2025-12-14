import { Home, Bell, MessageSquare, Clock, User, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export function BottomNavigation({
  activeTab,
  onTabChange,
  notificationCount = 0,
}) {
  const tabs = [
    { id: "dashboard", icon: Home, label: "Dashboard" },
    {
      id: "notifications",
      icon: Bell,
      label: "Notifications",
      badge: notificationCount,
    },
    { id: "messages", icon: MessageSquare, label: "Messages" },
    { id: "history", icon: Clock, label: "History" },
    { id: "profile", icon: User, label: "Profil" },
    { id: "logout", icon: LogOut, label: "Quitter" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200/50 shadow-2xl shadow-slate-900/10">
      <div className="flex">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => {
                if (tab.id === "logout") {
                  localStorage.removeItem("authToken");
                  window.location.reload();
                  return;
                }
                onTabChange(tab.id);
              }}

              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all duration-300 ${
                tab.id === "logout"
                  ? "text-red-600 hover:text-red-700 hover:bg-red-50/40"
                  : isActive
                    ? "text-blue-600 bg-blue-50/50"
                    : "text-muted-foreground hover:text-blue-500 hover:bg-blue-50/30"
              }`}

              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <IconComponent
                  className={`w-5 h-5 mb-1 ${isActive ? "fill-current" : ""}`}
                />
                {tab.badge && tab.badge > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  >
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </motion.div>
                )}
              </div>
              <span className={`text-xs ${isActive ? "text-blue-600" : ""}`}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
