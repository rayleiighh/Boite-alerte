import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  User,
  Shield,
  Mail,
  CheckCircle,
  XCircle,
  Database,
  Activity,
  Lock,
} from "lucide-react";


export default function Profile() {
  // Pour l'instant on mocke les données (on branchera le backend après)
  const [adminInfo] = useState({
    username: "admin",
    role: "Administrateur",
    email: "admin@boitealerte.local",
    createdAt: "01/11/2025",
    lastLogin: "Aujourd'hui, 10:32",
    status: "actif",
  });

  const [securityInfo] = useState({
    hashAlgo: "Argon2id",
    lastPasswordChange: "Il y a 15 jours",
  });

  const [systemStatus] = useState({
    backend: "ok",
    db: "ok",
    uptime: "3 jours 4h 12min",
  });

  const handleChangePassword = () => {
    // Plus tard: ouvrir un modal + appel backend /auth/change-password
    alert("Plus tard on ouvrira une pop-up pour changer le mot de passe 🔐");
  };

  const handleRevokeToken = () => {
    // Plus tard: appel backend pour invalider le token
    alert("Plus tard on révoquera le token côté serveur ✅");
  };

  const [notificationEmails, setNotificationEmails] = useState([]);
  useEffect(() => {
  const fetchEmails = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/users/notified-emails", {
        headers: {
          "X-API-Key": import.meta.env.VITE_API_KEY
        }
      });

      setNotificationEmails(res.data);
    } catch (err) {
      console.error("Erreur récupération emails :", err);
    }
  };

  fetchEmails();
}, []);



  return (
    <div className="w-full min-h-full p-6 space-y-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-white" />
            Profil administrateur
          </h1>
          <p className="text-white/70 text-sm">
            Informations du compte et état du système
          </p>
        </div>
      </motion.div>

      {/* GRID PRINCIPALE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* INFOS ADMIN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-1 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Infos administrateur
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Nom d’utilisateur</span>
              <span className="text-white font-medium">
                {adminInfo.username}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">Rôle</span>
              <span className="text-white font-medium">{adminInfo.role}</span>
            </div>

            <div className="flex justify-between items-start">
            <span className="text-white/60">Email de notification</span>

            <div className="flex flex-col items-start gap-1">
            {notificationEmails.length === 0 ? (
                <span className="text-white/60 italic text-sm">
                Aucun email enregistré
                </span>
            ) : (
                notificationEmails.map((email, index) => (
                <div
                    key={index}
                    className="text-white font-medium flex items-center gap-2"
                >
                    <Mail className="w-4 h-4 text-white/80 shrink-0" />
                    <span className="break-all">{email}</span>
                </div>
                ))
            )}
            </div>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">Dernière connexion</span>
              <span className="text-white font-medium">
                {adminInfo.lastLogin}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">Statut</span>
              <span className="flex items-center gap-1">
                {adminInfo.status === "actif" ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-200 font-medium">Actif</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-200 font-medium">Inactif</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </motion.div>

        {/* SÉCURITÉ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-1 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Sécurité du compte
          </h2>

          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-white/60">Algorithme de hash</span>
              <span className="text-emerald-200 font-medium">
                {securityInfo.hashAlgo}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">
                Dernière modification du mot de passe
              </span>
              <span className="text-white font-medium">
                {securityInfo.lastPasswordChange}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleChangePassword}
              className="w-full flex items-center justify-center gap-2 bg-white text-indigo-600 font-semibold py-2.5 rounded-xl shadow-md hover:bg-slate-100 transition"
            >
              <Lock className="w-4 h-4" />
              Changer le mot de passe
            </button>

            <button
              onClick={handleRevokeToken}
              className="w-full flex items-center justify-center gap-2 bg-red-500/90 text-white font-semibold py-2.5 rounded-xl shadow-md hover:bg-red-600 transition"
            >
              <Activity className="w-4 h-4" />
              Révoquer le token actuel
            </button>
          </div>
        </motion.div>

        {/* ÉTAT DU SYSTÈME */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-1 bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            État du système
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Backend</span>
              <span className="flex items-center gap-1">
                {systemStatus.backend === "ok" ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-200 font-medium">En ligne</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-200 font-medium">Hors ligne</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">MongoDB</span>
              <span className="flex items-center gap-1">
                {systemStatus.db === "ok" ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-200 font-medium">Connecté</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-200 font-medium">Erreur</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">Uptime serveur</span>
              <span className="text-white font-medium">
                {systemStatus.uptime}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
