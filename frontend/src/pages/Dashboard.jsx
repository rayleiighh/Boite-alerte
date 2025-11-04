import {
  Mail,
  Package,
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Button } from "../components/button";
import { Card } from "../components/card";
import { Badge } from "../components/badge";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function Dashboard({ mailboxStatus, lastActivity, onViewDetails }) {
  // Mock data for charts
  const weeklyData = [
    { day: "Lun", courriers: 2, colis: 1 },
    { day: "Mar", courriers: 1, colis: 0 },
    { day: "Mer", courriers: 3, colis: 1 },
    { day: "Jeu", courriers: 2, colis: 2 },
    { day: "Ven", courriers: 4, colis: 1 },
    { day: "Sam", courriers: 1, colis: 0 },
    { day: "Dim", courriers: 0, colis: 1 },
  ];

  const monthlyData = [
    { name: "Sem 1", total: 8 },
    { name: "Sem 2", total: 12 },
    { name: "Sem 3", total: 10 },
    { name: "Sem 4", total: 15 },
  ];

  const getStatusInfo = () => {
    switch (mailboxStatus) {
      case "empty":
        return {
          icon: CheckCircle,
          text: "Boîte aux lettres vide",
          description: "Aucun courrier en attente",
          color: "bg-green-100 text-green-700",
          iconColor: "text-green-600",
        };
      case "mail":
        return {
          icon: Mail,
          text: "Courrier reçu",
          description: "Nouveau courrier disponible",
          color: "bg-blue-100 text-blue-700",
          iconColor: "text-blue-600",
        };
      case "package":
        return {
          icon: Package,
          text: "Colis détecté",
          description: "Colis en attente de récupération",
          color: "bg-orange-100 text-orange-700",
          iconColor: "text-orange-600",
        };
      case "both":
        return {
          icon: AlertCircle,
          text: "Courrier et colis",
          description: "Plusieurs éléments disponibles",
          color: "bg-purple-100 text-purple-700",
          iconColor: "text-purple-600",
        };
      default:
        return {
          icon: CheckCircle,
          text: "État inconnu",
          description: "Vérification en cours...",
          color: "bg-gray-100 text-gray-700",
          iconColor: "text-gray-600",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const hasContent = mailboxStatus !== "empty";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        className="text-center lg:text-left"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
          <motion.div
            animate={{
              rotate: hasContent ? [0, 10, -10, 0] : 0,
            }}
            transition={{
              duration: 2,
              repeat: hasContent ? Infinity : 0,
              repeatDelay: 5,
            }}
          >
            <Sparkles className="w-6 h-6 text-blue-500" />
          </motion.div>
          <h1 className="bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
            Ma Boîte aux Lettres
          </h1>
        </div>
        <p className="text-muted-foreground">État en temps réel</p>
      </motion.div>

      {/* Main Content - 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Status Card */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 lg:p-8 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-sm border-0 shadow-xl shadow-slate-200/20">
              <div className="text-center space-y-4">
                <motion.div
                  className={`w-20 h-20 rounded-full ${statusInfo.color} flex items-center justify-center mx-auto relative shadow-lg`}
                  animate={
                    hasContent
                      ? {
                          scale: [1, 1.05, 1],
                          boxShadow: [
                            `0 0 0 0px ${
                              statusInfo.iconColor.includes("blue")
                                ? "rgba(59, 130, 246, 0.4)"
                                : statusInfo.iconColor.includes("orange")
                                  ? "rgba(249, 115, 22, 0.4)"
                                  : statusInfo.iconColor.includes("purple")
                                    ? "rgba(147, 51, 234, 0.4)"
                                    : "rgba(34, 197, 94, 0.4)"
                            }`,
                            `0 0 0 10px ${
                              statusInfo.iconColor.includes("blue")
                                ? "rgba(59, 130, 246, 0.1)"
                                : statusInfo.iconColor.includes("orange")
                                  ? "rgba(249, 115, 22, 0.1)"
                                  : statusInfo.iconColor.includes("purple")
                                    ? "rgba(147, 51, 234, 0.1)"
                                    : "rgba(34, 197, 94, 0.1)"
                            }`,
                            `0 0 0 0px ${
                              statusInfo.iconColor.includes("blue")
                                ? "rgba(59, 130, 246, 0)"
                                : statusInfo.iconColor.includes("orange")
                                  ? "rgba(249, 115, 22, 0)"
                                  : statusInfo.iconColor.includes("purple")
                                    ? "rgba(147, 51, 234, 0)"
                                    : "rgba(34, 197, 94, 0)"
                            }`,
                          ],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: hasContent ? Infinity : 0,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                >
                  <motion.div
                    animate={
                      hasContent
                        ? {
                            rotate: [0, -3, 3, -3, 0],
                          }
                        : {}
                    }
                    transition={{
                      duration: 0.6,
                      repeat: hasContent ? Infinity : 0,
                      repeatDelay: 3,
                      ease: "easeInOut",
                    }}
                  >
                    <StatusIcon
                      className={`w-10 h-10 ${statusInfo.iconColor}`}
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <h2 className="mb-1 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                    {statusInfo.text}
                  </h2>
                  <p className="text-muted-foreground">
                    {statusInfo.description}
                  </p>
                </motion.div>

                {mailboxStatus !== "empty" && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.4,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300,
                    }}
                  >
                    <Badge
                      variant="secondary"
                      className="mt-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-lg"
                    >
                      {mailboxStatus === "mail"
                        ? "1 élément"
                        : mailboxStatus === "package"
                          ? "1 colis"
                          : "2+ éléments"}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions - Mobile only */}
          <motion.div
            className="space-y-3 lg:hidden"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <motion.div
              className="w-full"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={onViewDetails}
                className="w-full aspect-square rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 border-0"
                disabled={mailboxStatus === "empty"}
              >
                Consulter le détail
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats - Mobile only */}
          {lastActivity && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="lg:hidden"
            >
              <Card className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border-0 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Dernière activité
                  </span>
                  <span className="text-slate-700">{lastActivity}</span>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Charts Section - Desktop only */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
            {/* Weekly Activity Chart */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Card className="p-4 bg-white border-0 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <h3 className="font-semibold text-slate-800 text-sm">
                    Activité de la semaine
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="courriers"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar dataKey="colis" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-3 mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <span className="text-muted-foreground">Courriers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                    <span className="text-muted-foreground">Colis</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Monthly Trend */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <Card className="p-4 bg-white border-0 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-semibold text-slate-800 text-sm">
                    Tendance mensuelle
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient
                        id="colorTotal"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Total ce mois:{" "}
                    <span className="font-semibold text-indigo-600">
                      45 items
                    </span>
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Charts Section - Mobile only */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            {/* Weekly Activity Chart - Mobile */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <Card className="p-3 bg-white border-0 shadow-md">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  <h3 className="font-semibold text-slate-800 text-xs">
                    Semaine
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={weeklyData}>
                    <Bar
                      dataKey="courriers"
                      fill="#3b82f6"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar dataKey="colis" fill="#f97316" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-muted-foreground text-[10px]">C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-muted-foreground text-[10px]">P</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Monthly Trend - Mobile */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.3 }}
            >
              <Card className="p-3 bg-white border-0 shadow-md">
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="w-3 h-3 text-indigo-600" />
                  <h3 className="font-semibold text-slate-800 text-xs">Mois</h3>
                </div>
                <ResponsiveContainer width="100%" height={100}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient
                        id="colorTotalMobile"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTotalMobile)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-2 text-center">
                  <p className="text-[10px] text-muted-foreground">
                    <span className="font-semibold text-indigo-600">
                      45 items
                    </span>
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Right Column - Sidebar (Desktop only) */}
        <div className="hidden lg:block lg:col-span-1">
          <motion.div
            className="space-y-4 sticky top-6"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {/* Quick Actions */}
            <Card className="p-6 bg-white border-0 shadow-lg">
              <h3 className="font-semibold text-slate-800 mb-4">
                Actions rapides
              </h3>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={onViewDetails}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 border-0"
                  disabled={mailboxStatus === "empty"}
                >
                  Consulter le détail
                </Button>
              </motion.div>
            </Card>

            {/* Last Activity */}
            {lastActivity && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <Card className="p-6 bg-gradient-to-r from-slate-50 to-blue-50/30 border-0 shadow-md">
                  <h3 className="font-semibold text-slate-800 mb-3">
                    Dernière activité
                  </h3>
                  <p className="text-slate-700 text-sm">{lastActivity}</p>
                </Card>
              </motion.div>
            )}

            {/* Weekly Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50/30 border-0 shadow-md">
                <h3 className="font-semibold text-slate-800 mb-3">
                  Cette semaine
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Courriers</span>
                    <span className="text-green-700 font-semibold">5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Colis</span>
                    <span className="text-green-700 font-semibold">2</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Response Time */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.3 }}
            >
              <Card className="p-6 bg-gradient-to-r from-purple-50 to-violet-50/30 border-0 shadow-md">
                <h3 className="font-semibold text-slate-800 mb-3">
                  Performance
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Temps de réponse
                    </span>
                    <span className="text-purple-700 font-semibold">
                      &lt; 1 min
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
