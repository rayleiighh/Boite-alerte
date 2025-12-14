import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, User, LogIn } from "lucide-react";
import axios from "axios";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5001/auth/login", {
        username,
        password,
      });

      sessionStorage.setItem("authToken", res.data.token);
      onLoginSuccess();
    } catch (err) {
      setError("Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-100 to-slate-200 p-4">
      
      {/* Carte principale */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-200"
      >
        
        {/* Titre */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-1">
            Boite Alerte
          </h1>
          <p className="text-slate-500">Connexion sécurisée</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-100 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />

            <button
              type="button"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              onTouchStart={() => setShowPassword(true)}
              onTouchEnd={() => setShowPassword(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              tabIndex={-1}
            >
              👁
            </button>
          </div>


          {/* Erreur */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center font-medium"
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
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
            <LogIn className="w-5 h-5" />
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-400 text-xs">
          © {new Date().getFullYear()} Boite Alerte — Accès sécurisé
        </div>
      </motion.div>
    </div>
  );
}
