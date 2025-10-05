// Side navigation for desktop

import { Home, Bell, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export function SideNavigation({
  activeTab,
  onTabChange,
  notificationCount = 0,
}) {
  const tabs = [
    {
      id: "dashboard",
      icon: Home,
      label: "Dashboard",
    },
    {
      id: "notifications",
      icon: Bell,
      label: "Notifications",
      badge: notificationCount,
    },
    {
      id: "messages",
      icon: MessageSquare,
      label: "Messages",
    },
  ];

  return (
    <div className="w-64 bg-white/80 backdrop-blur-lg border-r border-slate-200/50 shadow-xl shadow-slate-900/5 h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="bg-gradient-to-r from-blue-600 to-slate-800 bg-clip-text text-transparent">
              Boite alerte
            </h2>
          </div>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                    : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50/50"
                }`}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative">
                  <IconComponent className="w-5 h-5" />
                  {tab.badge && tab.badge > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
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
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
