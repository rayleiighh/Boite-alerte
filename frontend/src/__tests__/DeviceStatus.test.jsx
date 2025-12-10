// frontend/src/__tests__/DeviceStatus.test.jsx
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DeviceStatus from '../components/DeviceStatus';

describe('DeviceStatus Component', () => {

  beforeEach(() => {
    // Mock fetch global
    global.fetch = vi.fn();
  });

  describe('États de connexion', () => {
    
    test('Affiche "Connecté" si ageSeconds < 60', async () => {
      const mockResponse = {
        connected: true,
        ageSeconds: 30,
        heartbeat: {
          deviceID: 'esp32-mailbox-001',
          timestamp: new Date().toISOString(),
          uptime_s: 300,
          event_count: 5,
          rssi: -55,
          weight_g: 12.5,
          beam_state: true,
          battery_percent: 75
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DeviceStatus deviceID="esp32-mailbox-001" />);

      await waitFor(() => {
        expect(screen.getByText(/ESP32 Connecté/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/il y a 30s/i)).toBeInTheDocument();
    });

    test('Affiche "Connexion instable" si ageSeconds entre 60 et 300', async () => {
      const mockResponse = {
        connected: false,
        ageSeconds: 120,
        heartbeat: {
          deviceID: 'esp32-mailbox-001',
          uptime_s: 200,
          event_count: 3,
          rssi: -70,
          battery_percent: 50
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DeviceStatus />);

      await waitFor(() => {
        expect(screen.getByText(/Connexion instable/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/il y a 2min/i)).toBeInTheDocument();
      expect(screen.getByText(/Vérifiez le WiFi ou l'alimentation/i)).toBeInTheDocument();
    });

    test('Affiche "Déconnecté" si ageSeconds >= 300', async () => {
      const mockResponse = {
        connected: false,
        ageSeconds: 400,
        lastSeen: new Date(Date.now() - 400000).toISOString()
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DeviceStatus />);

      await waitFor(() => {
        expect(screen.getByText(/ESP32 Déconnecté/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Problème WiFi, alimentation ou crash/i)).toBeInTheDocument();
      expect(screen.getByText(/Actions recommandées/i)).toBeInTheDocument();
    });

    test('Affiche "Déconnecté" si aucun heartbeat reçu', async () => {
      const mockResponse = {
        connected: false,
        lastSeen: null
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DeviceStatus />);

      await waitFor(() => {
        expect(screen.getByText(/ESP32 Déconnecté/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Aucun heartbeat reçu/i)).toBeInTheDocument();
    });
  });

  describe('Affichage des statistiques', () => {
    
    test('Affiche toutes les stats enrichies quand device connecté', async () => {
      const mockResponse = {
        connected: true,
        ageSeconds: 15,
        heartbeat: {
          deviceID: 'esp32-mailbox-001',
          uptime_s: 7200, // 2 heures
          event_count: 12,
          rssi: -60,
          weight_g: 25.5,
          beam_state: true,
          battery_percent: 85
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DeviceStatus />);

      await waitFor(() => {
        // Uptime
        expect(screen.getByText(/2h 0min/i)).toBeInTheDocument();
        
        // WiFi
        expect(screen.getByText(/-60 dBm/i)).toBeInTheDocument();
        expect(screen.getByText(/Très bon/i)).toBeInTheDocument();
        
        // Events
        expect(screen.getByText(/12/)).toBeInTheDocument();
        
        // Batterie
        expect(screen.getByText(/85%/)).toBeInTheDocument();
        
        // Poids
        expect(screen.getByText(/25\.500 g/i)).toBeInTheDocument();
        expect(screen.getByText(/IR bloqué/i)).toBeInTheDocument();
      });
    });

    test('Affiche N/A pour batterie si null', async () => {
      const mockResponse = {
        connected: true,
        ageSeconds: 20,
        heartbeat: {
          deviceID: 'esp32-mailbox-001',
          uptime_s: 100,
          event_count: 2,
          rssi: -65,
          battery_percent: null
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DeviceStatus />);

      await waitFor(() => {
        expect(screen.getByText(/N\/A/)).toBeInTheDocument();
      });
    });

    test('Affiche alerte batterie faible si <= 20%', async () => {
      const mockResponse = {
        connected: true,
        ageSeconds: 10,
        heartbeat: {
          deviceID: 'esp32-mailbox-001',
          uptime_s: 500,
          event_count: 5,
          rssi: -55,
          battery_percent: 15
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DeviceStatus />);

      await waitFor(() => {
        expect(screen.getByText(/15%/)).toBeInTheDocument();
        expect(screen.getByText(/Faible/i)).toBeInTheDocument();
      });
    });

    test('Qualité WiFi - Excellent pour rssi >= -50', async () => {
      const mockResponse = {
        connected: true,
        ageSeconds: 5,
        heartbeat: {
          deviceID: 'esp32-mailbox-001',
          rssi: -45,
          uptime_s: 100,
          event_count: 1
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DeviceStatus />);

      await waitFor(() => {
        expect(screen.getByText(/Excellent/i)).toBeInTheDocument();
      });
    });

    test('Qualité WiFi - Faible pour rssi < -70', async () => {
      const mockResponse = {
        connected: true,
        ageSeconds: 5,
        heartbeat: {
          deviceID: 'esp32-mailbox-001',
          rssi: -75,
          uptime_s: 100,
          event_count: 1
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DeviceStatus />);

      await waitFor(() => {
        expect(screen.getByText(/Faible/i)).toBeInTheDocument();
      });
    });
  });

  describe('Polling et rafraîchissement', () => {
    
    test('Appelle API toutes les 10 secondes', async () => {
      const mockResponse = {
        connected: true,
        ageSeconds: 10,
        heartbeat: {
          deviceID: 'esp32-mailbox-001',
          uptime_s: 100,
          event_count: 1,
          rssi: -60
        }
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      render(<DeviceStatus />);

      // Premier appel au montage
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const initialCallCount = global.fetch.mock.calls.length;

      // Attendre un peu plus de 10 secondes pour le prochain polling
      await new Promise(resolve => setTimeout(resolve, 11000));

      // Vérifier qu'au moins un appel supplémentaire a été effectué
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(initialCallCount + 1);
      }, { timeout: 2000 });
    }, 15000); // Timeout de 15 secondes pour ce test

    test('Nettoie interval au démontage', () => {
      vi.useFakeTimers();

      const mockResponse = {
        connected: true,
        ageSeconds: 5,
        heartbeat: { deviceID: 'esp32-mailbox-001', uptime_s: 50 }
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const { unmount } = render(<DeviceStatus />);

      unmount();

      // Avancer le temps et vérifier qu'il n'y a pas de nouveaux appels
      const callCountBefore = global.fetch.mock.calls.length;
      vi.advanceTimersByTime(20000);
      
      expect(global.fetch.mock.calls.length).toBe(callCountBefore);

      vi.useRealTimers();
    });
  });

  describe('États de chargement et erreurs', () => {
    
    test('Affiche loading au chargement initial', () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Ne se résout jamais

      render(<DeviceStatus />);

      expect(screen.getByText(/Vérification connexion ESP32/i)).toBeInTheDocument();
    });

    test('Gère erreur API gracieusement', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      render(<DeviceStatus />);

      await waitFor(() => {
        expect(screen.getByText(/ESP32 Déconnecté/i)).toBeInTheDocument();
      });
    });

    test('Gère erreur réseau gracieusement', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<DeviceStatus />);

      await waitFor(() => {
        expect(screen.getByText(/ESP32 Déconnecté/i)).toBeInTheDocument();
      });
    });
  });

  describe('Props deviceID', () => {
    
    test('Utilise deviceID par défaut si non fourni', async () => {
      const mockResponse = {
        connected: true,
        ageSeconds: 10,
        heartbeat: { deviceID: 'esp32-mailbox-001', uptime_s: 100 }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DeviceStatus />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('deviceID=esp32-mailbox-001'),
          expect.any(Object)
        );
      });
    });

    test('Utilise deviceID personnalisé si fourni', async () => {
      const mockResponse = {
        connected: true,
        ageSeconds: 10,
        heartbeat: { deviceID: 'custom-device-123', uptime_s: 100 }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DeviceStatus deviceID="custom-device-123" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('deviceID=custom-device-123'),
          expect.any(Object)
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/custom-device-123/)).toBeInTheDocument();
      });
    });
  });

  describe('Headers API', () => {
    
    test('Envoie header X-API-Key correct', async () => {
      const mockResponse = {
        connected: true,
        ageSeconds: 10,
        heartbeat: { deviceID: 'esp32-mailbox-001', uptime_s: 100 }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<DeviceStatus />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-API-Key': expect.any(String)
            })
          })
        );
      });
    });
  });
});