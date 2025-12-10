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

  // ==========================
  // 1️⃣ ÉTATS CONNEXION BACKEND
  // ==========================
  const [adminInfo, setAdminInfo] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [notificationEmails, setNotificationEmails] = useState([]);

  // ==========================
  // 2️⃣ CHARGER LES DONNÉES DU BACKEND
  // ==========================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const res = await axios.get("http://localhost:5001/system/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-API-Key": import.meta.env.VITE_API_KEY,
          },
        });

        setAdminInfo({
          username: res.data.username,
          role: "Administrateur",
          email: res.data.email || "Aucun email défini",
          lastLogin: new Date(res.data.lastLogin).toLocaleString("fr-FR"),
          status: res.data.active ? "actif" : "inactif",
        });

        setSystemStatus({
          backend: res.data.backend,
          db: res.data.mongo === "connected" ? "ok" : "error",
          uptime: formatUptime(res.data.uptime),
        });

      } catch (err) {
        console.error("Erreur récupération profil:", err);
      }
    };

    const fetchEmails = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/users/notified-emails", {
          headers: { "X-API-Key": import.meta.env.VITE_API_KEY }
        });
        setNotificationEmails(res.data);
      } catch (err) {
        console.error("Erreur récupération emails :", err);
      }
    };

    fetchProfile();
    fetchEmails();
  }, []);

  // Format uptime en "X jours Yh Zmin"
  function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}j ${h}h ${m}min`;
  }

  // Si pas encore chargé → éviter crash
  if (!adminInfo || !systemStatus) {
    return (
      <div className="w-full min-h-full p-6 text-center text-slate-600">
        Chargement du profil...
      </div>
    );
  }

  // ==========================
  // 3️⃣ AFFICHAGE (inchangé, juste relié au backend)
  // ==========================
  return (
    <div className="w-full min-h-full p-6 space-y-6 bg-slate-50">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600" />
            Profil administrateur
          </h1>
          <p className="text-slate-500 text-sm">
            Informations du compte et état du système
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* INFOS ADMIN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Infos administrateur
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-slate-500">Nom d’utilisateur</span>
              <span className="text-slate-800 font-medium">{adminInfo.username}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Rôle</span>
              <span className="text-slate-800 font-medium">{adminInfo.role}</span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-slate-500">Emails notifiés</span>

              <div className="flex flex-col items-start gap-1">
                {notificationEmails.length === 0 ? (
                  <span className="text-slate-400 italic text-sm">
                    Aucun email enregistré
                  </span>
                ) : (
                  notificationEmails.map((email, index) => (
                    <div key={index} className="text-slate-800 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-indigo-500" />
                      <span className="break-all">{email}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Dernière connexion</span>
              <span className="text-slate-800 font-medium">{adminInfo.lastLogin}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Statut</span>
              <span className="flex items-center gap-1">
                {adminInfo.status === "actif" ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">Actif</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 font-medium">Inactif</span>
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
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Sécurité du compte
          </h2>

          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Algorithme de hash</span>
              <span className="text-emerald-600 font-medium">Argon2id</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Dernière modification du mot de passe</span>
              <span className="text-slate-800 font-medium">Gestion à venir</span>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition">
              <Lock className="w-4 h-4" />
              Changer le mot de passe
            </button>
          </div>
        </motion.div>

        {/* ÉTAT DU SYSTÈME */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-6"
        >
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            État du système
          </h2>

          <div className="space-y-3 text-sm">
            
            <div className="flex justify-between">
              <span className="text-slate-500">Backend</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 font-medium">En ligne</span>
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">MongoDB</span>
              <span className="flex items-center gap-1">
                {systemStatus.db === "ok" ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">Connecté</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 font-medium">Erreur</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Uptime serveur</span>
              <span className="text-slate-800 font-medium">{systemStatus.uptime}</span>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
