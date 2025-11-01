// src/services/users.api.js

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
const API_KEY = import.meta.env.VITE_API_KEY || "dev-local-key";

const headers = { 
  "X-API-Key": API_KEY,
  "Content-Type": "application/json"
};

// S'inscrire pour recevoir les notifications par email
export async function subscribeEmail(email, preferences = {}) {
  try {
    const r = await fetch(`${API_BASE}/api/users/subscribe`, {
      method: "POST",
      headers,
      body: JSON.stringify({ 
        email,
        ...preferences 
      }),
    });
    
    if (!r.ok) {
      const error = await r.json();
      throw new Error(error.error || "Erreur d'inscription");
    }
    
    const data = await r.json();
    console.log("✅ Inscription réussie:", data);
    return { success: true, data };
  } catch (err) {
    console.error("❌ Erreur subscribeEmail:", err);
    return { success: false, error: err.message };
  }
}

// Se désinscrire
export async function unsubscribeEmail(email) {
  try {
    const r = await fetch(`${API_BASE}/api/users/unsubscribe`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email }),
    });
    
    if (!r.ok) {
      const error = await r.json();
      throw new Error(error.error || "Erreur de désinscription");
    }
    
    const data = await r.json();
    console.log("✅ Désinscription réussie:", data);
    return { success: true, data };
  } catch (err) {
    console.error("❌ Erreur unsubscribeEmail:", err);
    return { success: false, error: err.message };
  }
}

// Liste des utilisateurs inscrits (admin)
export async function getSubscribers() {
  try {
    const r = await fetch(`${API_BASE}/api/users`, { headers });
    
    if (!r.ok) throw new Error("Erreur lors de la récupération");
    
    const data = await r.json();
    return { success: true, data };
  } catch (err) {
    console.error("❌ Erreur getSubscribers:", err);
    return { success: false, error: err.message };
  }
}