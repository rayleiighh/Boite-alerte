const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export async function login(username, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Erreur de connexion");
  }

  return data; // { token }
}
