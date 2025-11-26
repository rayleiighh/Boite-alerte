import { useState, useEffect } from "react";
import { subscribeEmail, unsubscribeEmail } from "../services/users.api";
import "./PreferencesModal.css";

export default function PreferencesModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [types, setTypes] = useState({
    mail: true,
    package: true,
    alert: true,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Charge les préférences depuis le localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    const savedTypes = localStorage.getItem("notifTypes");

    if (savedEmail) setEmail(savedEmail);
    if (savedTypes) setTypes(JSON.parse(savedTypes));
  }, [isOpen]);

  // Ferme la modale avec Échap
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSave = async () => {
    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: " Email invalide" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    const result = await subscribeEmail(email, { types });

    if (result.success) {
      // Sauvegarde dans localStorage
      localStorage.setItem("userEmail", email);
      localStorage.setItem("notifTypes", JSON.stringify(types));
      localStorage.setItem("isSubscribed", "true");

      setMessage({ 
        type: "success", 
        text: " Préférences enregistrées ! Vous recevrez les notifications par email" 
      });

      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setMessage({ 
        type: "error", 
        text: ` ${result.error}` 
      });
    }

    setLoading(false);
  };

  const handleUnsubscribe = async () => {
    if (!email) {
      setMessage({ type: "error", text: " Aucun email à désinscrire" });
      return;
    }

    const confirm = window.confirm(
      "Êtes-vous sûr de vouloir vous désinscrire des notifications par email ?"
    );

    if (!confirm) return;

    setLoading(true);
    const result = await unsubscribeEmail(email);

    if (result.success) {
      // Supprime du localStorage
      localStorage.removeItem("userEmail");
      localStorage.removeItem("notifTypes");
      localStorage.removeItem("isSubscribed");

      setMessage({ 
        type: "success", 
        text: " Désinscription réussie" 
      });

      setTimeout(() => {
        setEmail("");
        onClose();
      }, 2000);
    } else {
      setMessage({ 
        type: "error", 
        text: ` ${result.error}` 
      });
    }

    setLoading(false);
  };

  const handleTypeToggle = (type) => {
    setTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2> Notifications par email</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              disabled={loading}
            />
            <small className="form-hint">
              Vous recevrez un email instantanément à chaque événement
            </small>
          </div>

          {/* Types de notifications */}
          <div className="form-group">
            <label>Types de notifications à recevoir</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={types.mail}
                  onChange={() => handleTypeToggle("mail")}
                  disabled={loading}
                />
                <span> Courrier</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={types.package}
                  onChange={() => handleTypeToggle("package")}
                  disabled={loading}
                />
                <span> Colis</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={types.alert}
                  onChange={() => handleTypeToggle("alert")}
                  disabled={loading}
                />
                <span> Alertes</span>
              </label>
            </div>
          </div>

          {/* Message de feedback */}
          {message.text && (
            <div className={`message message-${message.type}`}>
              {message.text}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={handleUnsubscribe}
            disabled={loading || !email}
          >
            Se désinscrire
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Sauvegarder"}
          </button>
        </div>
      </div>
    </div>
  );
}