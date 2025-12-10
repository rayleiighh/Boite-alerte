import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, User, LogIn } from "lucide-react";
import axios from "axios";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5001/auth/login", {
        username,
        password,
      });

      localStorage.setItem("authToken", res.data.token);
      onLoginSuccess();
    } catch (err) {
      setError("Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 p-4">
      
      {/* Carte principale */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30"
      >
        
        {/* Titre */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Boite Alerte
          </h1>
          <p className="text-white/70">Connexion sécurisée</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/40"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/40"
              required
            />
          </div>

          {/* Erreur */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-300 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Bouton */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white text-indigo-600 font-semibold py-3 rounded-xl shadow-lg hover:bg-slate-100 transition disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
            <LogIn className="w-5 h-5" />
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-white/60 text-xs">
          © {new Date().getFullYear()} Boite Alerte — Accès sécurisé
        </div>
      </motion.div>
    </div>
  );
}
