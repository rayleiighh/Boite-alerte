import {
  Mail,
  Package,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/button";
import { Card } from "../components/card";
import { Badge } from "../components/badge";
import { motion } from "framer-motion";

export function Dashboard({ mailboxStatus, lastActivity, onViewDetails }) {
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
    <div className="p-6 space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
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

      {/* Status Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-8 lg:p-12 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-sm border-0 shadow-xl shadow-slate-200/20">
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
                <StatusIcon className={`w-10 h-10 ${statusInfo.iconColor}`} />
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
              <p className="text-muted-foreground">{statusInfo.description}</p>
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

      {/* Quick Actions */}
      <motion.div
        className="space-y-3 lg:space-y-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
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
      </motion.div>

      {/* Last Activity & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        {lastActivity && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 border-0 shadow-md">
              <div className="flex items-center justify-between lg:flex-col lg:items-start lg:space-y-2">
                <span className="text-muted-foreground">Dernière activité</span>
                <span className="text-slate-700 lg:font-medium">
                  {lastActivity}
                </span>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="hidden lg:block"
        >
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50/30 border-0 shadow-md">
            <div className="flex flex-col space-y-2">
              <span className="text-muted-foreground">Cette semaine</span>
              <span className="text-green-700 font-medium">
                5 courriers, 2 colis
              </span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.3 }}
          className="hidden lg:block"
        >
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-violet-50/30 border-0 shadow-md">
            <div className="flex flex-col space-y-2">
              <span className="text-muted-foreground">Temps de réponse</span>
              <span className="text-purple-700 font-medium">&lt; 1 minute</span>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
