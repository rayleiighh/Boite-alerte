// src/services/display.api.js
/**
 * Service API pour la gestion de la configuration OLED
 * Endpoints : GET/PUT /api/display
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_KEY = import.meta.env.VITE_API_KEY || 'dev-local-key';

/**
 * Headers communs pour toutes les requêtes
 */
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
});

/**
 * GET - Récupérer la configuration OLED d'un device
 * @param {string} deviceID - ID du device (ex: "esp32-mailbox-001")
 * @returns {Promise<Object>} - { deviceID, houseNumber, message, updatedAt }
 * @throws {Error} Si la requête échoue
 */
export const getDisplayConfig = async (deviceID) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/display?deviceID=${encodeURIComponent(deviceID)}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Erreur ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log('✅ [API] Config OLED récupérée:', data);
    return data;
  } catch (error) {
    console.error('❌ [API] getDisplayConfig:', error);
    throw error;
  }
};

/**
 * PUT - Mettre à jour la configuration OLED
 * @param {Object} config - Configuration à enregistrer
 * @param {string} config.deviceID - ID du device
 * @param {string} config.houseNumber - Numéro de maison (max 10 caractères)
 * @param {string} config.message - Message défilant (max 100 caractères)
 * @returns {Promise<Object>} - { message, config }
 * @throws {Error} Si la requête échoue
 */
export const updateDisplayConfig = async (config) => {
  try {
    // Validation côté client
    if (!config.deviceID) {
      throw new Error('deviceID est requis');
    }
    if (!config.houseNumber || !config.houseNumber.trim()) {
      throw new Error('Le numéro de maison est requis');
    }
    if (!config.message || !config.message.trim()) {
      throw new Error('Le message est requis');
    }
    if (config.houseNumber.length > 10) {
      throw new Error('Le numéro de maison ne peut pas dépasser 10 caractères');
    }
    if (config.message.length > 100) {
      throw new Error('Le message ne peut pas dépasser 100 caractères');
    }

    const response = await fetch(`${API_BASE_URL}/api/display`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        deviceID: config.deviceID,
        houseNumber: config.houseNumber.trim(),
        message: config.message.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Erreur ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log('✅ [API] Config OLED mise à jour:', data);
    return data;
  } catch (error) {
    console.error('❌ [API] updateDisplayConfig:', error);
    throw error;
  }
};

/**
 * GET - Récupérer toutes les configurations OLED (admin)
 * @returns {Promise<Object>} - { total, configs: [...] }
 * @throws {Error} Si la requête échoue
 */
export const getAllDisplayConfigs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/display/all`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ [API] Toutes les configs récupérées:', data);
    return data;
  } catch (error) {
    console.error('❌ [API] getAllDisplayConfigs:', error);
    throw error;
  }
};

/**
 * Utilitaire : Tester la connexion API
 * @returns {Promise<boolean>} - true si le backend est accessible
 */
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'X-API-Key': API_KEY },
    });
    return response.ok;
  } catch (error) {
    console.error('❌ [API] Backend inaccessible:', error);
    return false;
  }
};