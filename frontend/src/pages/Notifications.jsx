import { useEffect, useMemo, useRef, useState } from "react";
import {
  getNotifications,
  markAllRead,
  markOneRead,
  deleteOne,
  subscribeRealtime,
} from "../services/notifications.api.js";
import PreferencesModal from "../components/PreferencesModal.jsx";
import "./Notifications.css";

// icônes simples inline (évite d'ajouter des deps)
const Icon = {
  mail: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
    </svg>
  ),
  package: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 7l9-4 9 4v10l-9 4-9-4V7z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M12 3v18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  alert: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v6M12 17h.01" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 1v6m0 6v6M23 12h-6m-6 0H1"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  ),
};

const TYPE_LABEL = { mail: "Courrier", package: "Colis", alert: "Alerte" };
const TYPE_COLOR = {
  mail: "#3b82f6",
  package: "#f97316",
  alert: "#ef4444",
  default: "#6b7280",
};

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [socketStatus, setSocketStatus] = useState("connecting");
  const [modalOpen, setModalOpen] = useState(false); // ✅ État de la modale
  const [isSubscribed, setIsSubscribed] = useState(false); // ✅ État d'inscription
  const subRef = useRef(null);

  // Vérifie si l'utilisateur est inscrit au chargement
  useEffect(() => {
    const subscribed = localStorage.getItem("isSubscribed") === "true";
    setIsSubscribed(subscribed);
  }, [modalOpen]); // Re-vérifie après fermeture de la modale

  // Chargement initial
  useEffect(() => {
    (async () => setItems(await getNotifications()))();
  }, []);

  // WebSocket temps réel
  useEffect(() => {
    const sub = subscribeRealtime({
      onOpen: () => setSocketStatus("open"),
      onClose: () => setSocketStatus("closed"),
      onError: () => setSocketStatus("closed"),
      onMessage: (n) => setItems((prev) => [n, ...prev]),
    });
    subRef.current = sub;
    setSocketStatus(sub.status());
    return () => sub.unsubscribe();
  }, []);

  const newCount = useMemo(() => items.filter((n) => n.isNew).length, [items]);

  const filtered = useMemo(() => {
    let arr = [...items];
    if (filter === "unread") arr = arr.filter((n) => n.isNew);
    else if (["mail", "package", "alert"].includes(filter))
      arr = arr.filter((n) => n.type === filter);
    if (q.trim()) {
      const s = q.toLowerCase();
      arr = arr.filter(
        (n) =>
          n.title.toLowerCase().includes(s) ||
          n.description.toLowerCase().includes(s) ||
          (TYPE_LABEL[n.type] || "").toLowerCase().includes(s) ||
          (n.time || "").toLowerCase().includes(s)
      );
    }
    return arr;
  }, [items, filter, q]);

  const onMarkAll = async () => {
    const ok = await markAllRead();
    if (ok) setItems((prev) => prev.map((n) => ({ ...n, isNew: false })));
  };

  const onMarkOne = async (id) => {
  console.log("🔍 Avant markOne:", items.find(n => n.id === id));
  const ok = await markOneRead(id);
  console.log("✅ markOneRead retourné:", ok);
  
  if (ok) {
    setItems((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isNew: false } : n));
      console.log("📊 Items après mise à jour:", updated);
      return updated;
    });
  }
};

  const onDelete = async (id) => {
    const ok = await deleteOne(id);
    if (ok) setItems((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <section className="notif-page">
      {/* Header */}
      <div className="notif-head">
        <div className="notif-counters">

          {/*  Indicateur d'inscription */}
          {isSubscribed && (
            <span className="subscription-badge">
               Email activé
            </span>
          )}

          {/* Bouton Préférences */}
          <button
            className="btn-preferences"
            onClick={() => setModalOpen(true)}
            title="Gérer les notifications par email"
          >
            {Icon.settings}
            <span>Préférences email</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="notif-toolbar">
        <div className="search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher… (titre, type, heure)"
          />
        </div>
        <div className="filters">
          {[
            { id: "all", label: "Tous" },
            { id: "unread", label: "Non lus" },
            { id: "mail", label: "Courrier" },
            { id: "package", label: "Colis" },
            { id: "alert", label: "Alertes" },
          ].map((f) => (
            <button
              key={f.id}
              className={filter === f.id ? "pill active" : "pill"}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
          <button className="pill ghost" onClick={onMarkAll}>
            Tout marquer lu
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="notif-grid">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon" style={{ color: "#6b7280" }}>
              {Icon.clock}
            </div>
            <h3>Aucune notification</h3>
            <p>Vous serez alerté dès qu'un courrier ou un colis arrive.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <article key={n.id} className={`card ${n.isNew ? "is-new" : ""}`}>
              <div
                className="card-left"
                style={{ color: TYPE_COLOR[n.type] || TYPE_COLOR.default }}
              >
                <div className="circle">{Icon[n.type] || Icon.clock}</div>
              </div>

              <div className="card-body">
                <div className="row">
                  <div className="title">
                    <h4 title={n.title}>{n.title}</h4>
                    <p title={n.description}>{n.description}</p>
                  </div>
                  <time className="time">{n.time}</time>
                </div>

                <div className="row gap">
                  <span
                    className="badge"
                    style={{
                      background: TYPE_COLOR[n.type] || TYPE_COLOR.default,
                    }}
                  >
                    {TYPE_LABEL[n.type] || "Autre"}
                  </span>

                  {n.isNew ? (
                    <button className="mini" onClick={() => onMarkOne(n.id)}>
                      Marquer lu
                    </button>
                  ) : (
                    <span className="muted">lu</span>
                  )}

                  <button
                    className="mini danger"
                    onClick={() => onDelete(n.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {n.isNew && <span className="dot" aria-label="non lu" />}
            </article>
          ))
        )}
      </div>

      {/* ✅ Modale de préférences */}
      <PreferencesModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}