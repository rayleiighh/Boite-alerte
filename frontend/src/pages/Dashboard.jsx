import { Button } from "../components/button";
import { Card } from "../components/card";
import { Badge } from "../components/badge";
import { motion } from "framer-motion";
import DeviceStatus from "../components/DeviceStatus";
import { useDashboardData } from "../hooks/useDashboardData";

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

import {
  Mail,
  Package, // Utilisé comme icône générique 'item'
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Calendar,
} from "lucide-react";

export function Dashboard({ onViewDetails }) {
  // MODIFICATION: Remplacement des totaux spécifiques par le total unifié
  const {
    mailboxStatus,
    lastActivity,
    weeklyData,
    monthlyData,
    weeklyTotalItems, // Nouvelle variable pour le total hebdomadaire
    monthlyTotal,
    deviceOnline,
    isLoading,
    error
  } = useDashboardData();

  const getStatusInfo = () => {
    switch (mailboxStatus) {
      case "empty":
        return {
          icon: CheckCircle,
          text: "Boîte aux lettres vide",
          description: "Aucun élément en attente", // Texte mis à jour
          color: "bg-green-100 text-green-700",
          iconColor: "text-green-600",
        };
      case "item": // Nouveau statut unique (fusion de mail/package/both)
        return {
          icon: Package, // Icône utilisée pour le statut "item"
          text: "Nouvel élément reçu",
          description: "Vérifiez votre boîte aux lettres", // Texte mis à jour
          color: "bg-blue-100 text-blue-700",
          iconColor: "text-blue-600",
        };
      // Suppression des cases "mail", "package", et "both"
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
                {/* ... (Animation de l'icône inchangée) ... */}
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
                      {/* SIMPLIFICATION DU TEXTE DU BADGE */}
                      {mailboxStatus === "item" ? `${weeklyTotalItems} élément(s) reçus cette semaine` : "Contenu détecté"}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>


          {/* Stats - Mobile only (Inchangé) */}
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
            {/* Weekly Activity Chart (Bar Chart CONSOLIDÉ) */}
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
                    {/* UTILISATION D'UNE SEULE CLÉ DE DONNÉE: 'total' */}
                    <Bar
                      dataKey="total"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    {/* Suppression de l'ancienne barre "colis" */}
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-3 mt-3 text-xs">
                  {/* SIMPLIFICATION DE LA LÉGENDE */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <span className="text-muted-foreground">Éléments reçus</span>
                  </div>
                  {/* Suppression de l'ancienne légende Colis */}
                </div>
              </Card>
            </motion.div>

            {/* Monthly Trend (Total mensuel mis à jour, Chart reste le même) */}
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
                      {/* ... (gradient) ... */}
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
                      {monthlyTotal} items
                    </span>
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Charts Section - Mobile only */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            {/* Weekly Activity Chart - Mobile (Bar Chart CONSOLIDÉ) */}
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
                    {/* UTILISATION D'UNE SEULE CLÉ DE DONNÉE: 'total' */}
                    <Bar
                      dataKey="total"
                      fill="#3b82f6"
                      radius={[2, 2, 0, 0]}
                    />
                    {/* Suppression de l'ancienne barre "colis" */}
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs">
                  {/* SIMPLIFICATION DE LA LÉGENDE MOBILE */}
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-muted-foreground text-[10px]">Éléments</span>
                  </div>
                  {/* Suppression de l'ancienne légende Colis mobile */}
                </div>
              </Card>
            </motion.div>

            {/* Monthly Trend - Mobile (Total mensuel mis à jour) */}
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
                    <defs> {/* ... (gradient) ... */}</defs>
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
                      {monthlyTotal} items
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

            <div className="p-6 space-y-6">
              {/* Indicateur connexion ESP32 en haut (Inchangé) */}
              <DeviceStatus deviceID="esp32-mailbox-001" />
            </div>

            {/* Last Activity (Inchangé) */}
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

            {/* Weekly Stats CONSOLIDÉ */}
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
                    <span className="text-muted-foreground">Éléments reçus</span>
                    {/* UTILISATION DU TOTAL UNIFIÉ */}
                    <span className="text-green-700 font-semibold">{weeklyTotalItems}</span>
                  </div>
                  {/* Suppression de la ligne "Colis" */}
                </div>
              </Card>
            </motion.div>

            {/* Response Time (Inchangé) */}
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