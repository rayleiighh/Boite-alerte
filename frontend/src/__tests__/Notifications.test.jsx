// frontend/src/__tests__/Notifications.test.jsx
// Tests pour la page Notifications (Saad)

import { describe, test, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import Notifications from '../pages/Notifications';

// ==================== MOCK DATA ====================

const mockNotifications = [
  {
    id: '1',
    type: 'mail',
    title: 'Nouvelle lettre reçue',
    description: 'Courrier standard déposé dans la boîte aux lettres',
    time: '14h30',
    timestamp: '2025-12-06T14:30:00Z',
    isNew: true,
  },
  {
    id: '2',
    type: 'package',
    title: 'Colis détecté',
    description: 'Colis de taille moyenne en attente',
    time: '12h15',
    timestamp: '2025-12-06T12:15:00Z',
    isNew: true,
  },
  {
    id: '3',
    type: 'mail',
    title: 'Courrier collecté',
    description: 'Le courrier a été récupéré',
    time: 'Hier 16h45',
    timestamp: '2025-12-05T16:45:00Z',
    isNew: false,
  },
  {
    id: '4',
    type: 'alert',
    title: 'Alerte système',
    description: 'Vérifiez la boîte aux lettres',
    time: 'Hier 09h00',
    timestamp: '2025-12-05T09:00:00Z',
    isNew: false,
  },
];

// ==================== MSW SERVER ====================

const API_URL = 'http://localhost:5001';

const handlers = [
  // GET /api/notifications
  http.get(`${API_URL}/api/notifications`, () => {
    return HttpResponse.json(mockNotifications);
  }),

  // POST /api/notifications
  http.post(`${API_URL}/api/notifications`, async () => {
    return HttpResponse.json({
      message: '✅ Notification créée',
      event: 'event-123',
      notification: 'notif-123',
      emailsSent: 1,
    }, { status: 201 });
  }),

  // POST /api/notifications/:id/read
  http.post(`${API_URL}/api/notifications/:id/read`, () => {
    return HttpResponse.json({ message: 'Marquée comme lue' });
  }),

  // POST /api/notifications/mark-all-read
  http.post(`${API_URL}/api/notifications/mark-all-read`, () => {
    return HttpResponse.json({ message: 'Toutes marquées comme lues' });
  }),

  // DELETE /api/notifications/:id
  http.delete(`${API_URL}/api/notifications/:id`, () => {
    return HttpResponse.json({ message: 'Supprimée' });
  }),
];

const server = setupServer(...handlers);

// ==================== SETUP ====================

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });

  // Mock WebSocket
  vi.stubGlobal('WebSocket', class {
    constructor() {
      this.readyState = 1;
    }
    addEventListener() {}
    removeEventListener() {}
    close() {}
    send() {}
  });

  // Mock localStorage
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
  vi.unstubAllGlobals();
});

// ==================== TESTS: RENDU INITIAL ====================

describe('Notifications - Rendu initial', () => {

  test('Devrait afficher le titre "Notifications"', async () => {
    render(<Notifications />);
    
    expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument();
  });

  test('Devrait afficher le sous-titre "Alertes en temps réel"', async () => {
    render(<Notifications />);
    
    expect(screen.getByText(/alertes en temps réel/i)).toBeInTheDocument();
  });

  test('Devrait charger et afficher les notifications depuis l\'API', async () => {
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
    });

    expect(screen.getByText('Colis détecté')).toBeInTheDocument();
    expect(screen.getByText('Courrier collecté')).toBeInTheDocument();
    expect(screen.getByText('Alerte système')).toBeInTheDocument();
  });

  test('Devrait afficher le compteur de nouvelles notifications', async () => {
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText(/2 nouvelles notifications/i)).toBeInTheDocument();
    });
  });

  test('Devrait afficher le compteur total de notifications', async () => {
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText(/4 au total/i)).toBeInTheDocument();
    });
  });

  test('Devrait afficher le statut WebSocket', async () => {
    render(<Notifications />);
    
    expect(screen.getByText(/temps réel/i)).toBeInTheDocument();
  });

});

// ==================== TESTS: BOUTONS DE FILTRE ====================

describe('Notifications - Filtres', () => {

  test('Devrait afficher tous les boutons de filtre', async () => {
    render(<Notifications />);
    
    expect(screen.getByRole('button', { name: /tous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /non lus/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /courrier/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /colis/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alertes/i })).toBeInTheDocument();
  });

  test('Devrait filtrer par "Non lus"', async () => {
    const user = userEvent.setup();
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /non lus/i }));

    await waitFor(() => {
      // Non lus visibles
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
      expect(screen.getByText('Colis détecté')).toBeInTheDocument();
      // Lus non visibles
      expect(screen.queryByText('Courrier collecté')).not.toBeInTheDocument();
      expect(screen.queryByText('Alerte système')).not.toBeInTheDocument();
    });
  });

  test('Devrait filtrer par type "Courrier"', async () => {
    const user = userEvent.setup();
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /^courrier$/i }));

    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
      expect(screen.getByText('Courrier collecté')).toBeInTheDocument();
      expect(screen.queryByText('Colis détecté')).not.toBeInTheDocument();
    });
  });

  test('Devrait filtrer par type "Colis"', async () => {
    const user = userEvent.setup();
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Colis détecté')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /^colis$/i }));

    await waitFor(() => {
      expect(screen.getByText('Colis détecté')).toBeInTheDocument();
      expect(screen.queryByText('Nouvelle lettre reçue')).not.toBeInTheDocument();
    });
  });

  test('Devrait filtrer par type "Alertes"', async () => {
    const user = userEvent.setup();
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Alerte système')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /alertes/i }));

    await waitFor(() => {
      expect(screen.getByText('Alerte système')).toBeInTheDocument();
      expect(screen.queryByText('Nouvelle lettre reçue')).not.toBeInTheDocument();
    });
  });

  test('Devrait revenir à "Tous" après filtrage', async () => {
    const user = userEvent.setup();
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
    });

    // Filtrer par colis
    await user.click(screen.getByRole('button', { name: /^colis$/i }));
    
    await waitFor(() => {
      expect(screen.queryByText('Nouvelle lettre reçue')).not.toBeInTheDocument();
    });

    // Revenir à tous
    await user.click(screen.getByRole('button', { name: /tous/i }));

    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
      expect(screen.getByText('Colis détecté')).toBeInTheDocument();
    });
  });

});

// ==================== TESTS: RECHERCHE ====================

describe('Notifications - Recherche', () => {

  test('Devrait afficher le champ de recherche', async () => {
    render(<Notifications />);
    
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
  });

  test('Devrait filtrer par recherche textuelle', async () => {
    const user = userEvent.setup();
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Colis détecté')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    await user.type(searchInput, 'colis');

    await waitFor(() => {
      expect(screen.getByText('Colis détecté')).toBeInTheDocument();
      expect(screen.queryByText('Nouvelle lettre reçue')).not.toBeInTheDocument();
    });
  });

  test('Devrait rechercher dans le titre', async () => {
    const user = userEvent.setup();
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    await user.type(searchInput, 'lettre');

    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
    });
  });

  test('Devrait rechercher dans la description', async () => {
    const user = userEvent.setup();
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Colis détecté')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    await user.type(searchInput, 'attente');

    await waitFor(() => {
      expect(screen.getByText('Colis détecté')).toBeInTheDocument();
    });
  });

  test('Devrait afficher "Aucune notification" si recherche sans résultat', async () => {
    const user = userEvent.setup();
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/rechercher/i);
    await user.type(searchInput, 'xyzinexistant123');

    await waitFor(() => {
      expect(screen.getByText(/aucune notification/i)).toBeInTheDocument();
    });
  });

});

// ==================== TESTS: ACTIONS ====================

describe('Notifications - Actions', () => {

  test('Devrait afficher bouton "Marquer lu" pour notifications non lues', async () => {
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
    });

    const markReadButtons = screen.getAllByRole('button', { name: /marquer lu/i });
    expect(markReadButtons.length).toBe(2); // 2 non lues
  });

  test('Devrait marquer une notification comme lue au clic', async () => {
    const user = userEvent.setup();
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
    });

    const markReadButtons = screen.getAllByRole('button', { name: /marquer lu/i });
    await user.click(markReadButtons[0]);

    await waitFor(() => {
      // Devrait y avoir un bouton "Marquer lu" de moins
      const updatedButtons = screen.getAllByRole('button', { name: /marquer lu/i });
      expect(updatedButtons.length).toBe(1);
    });
  });

  test('Devrait afficher bouton "Tout marquer lu"', async () => {
    render(<Notifications />);
    
    expect(screen.getByRole('button', { name: /tout marquer lu/i })).toBeInTheDocument();
  });

  test('Devrait marquer toutes les notifications comme lues', async () => {
    const user = userEvent.setup();
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /tout marquer lu/i }));

    await waitFor(() => {
      const markReadButtons = screen.queryAllByRole('button', { name: /marquer lu/i });
      expect(markReadButtons.length).toBe(0);
    });
  });

  test('Devrait afficher boutons "Supprimer"', async () => {
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /supprimer/i });
    expect(deleteButtons.length).toBe(4);
  });

  test('Devrait supprimer une notification au clic', async () => {
    const user = userEvent.setup();
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Nouvelle lettre reçue')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /supprimer/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Nouvelle lettre reçue')).not.toBeInTheDocument();
    });
  });

});

// ==================== TESTS: PRÉFÉRENCES EMAIL ====================

describe('Notifications - Préférences email', () => {

  test('Devrait afficher bouton "Préférences email"', async () => {
    render(<Notifications />);
    
    expect(screen.getByText(/préférences email/i)).toBeInTheDocument();
  });

  test('Devrait ouvrir la modale au clic sur "Préférences email"', async () => {
    const user = userEvent.setup();
    render(<Notifications />);
    
    await user.click(screen.getByText(/préférences email/i));

    await waitFor(() => {
      // Vérifier qu'un élément de la modale est visible
      expect(screen.getByRole('dialog') || screen.getByText(/email/i)).toBeTruthy();
    });
  });

});

// ==================== TESTS: ÉTAT VIDE ====================

describe('Notifications - État vide', () => {

  test('Devrait afficher message si aucune notification', async () => {
    server.use(
      http.get(`${API_URL}/api/notifications`, () => {
        return HttpResponse.json([]);
      })
    );

    render(<Notifications />);

    await waitFor(() => {
      expect(screen.getByText(/aucune notification/i)).toBeInTheDocument();
    });
  });

  test('Devrait afficher message explicatif quand vide', async () => {
    server.use(
      http.get(`${API_URL}/api/notifications`, () => {
        return HttpResponse.json([]);
      })
    );

    render(<Notifications />);

    await waitFor(() => {
      expect(screen.getByText(/vous serez alerté/i)).toBeInTheDocument();
    });
  });

});

// ==================== TESTS: BADGES DE TYPE ====================

describe('Notifications - Badges de type', () => {

  test('Devrait afficher badge "Courrier" pour type mail', async () => {
    render(<Notifications />);
    
    await waitFor(() => {
      const badges = screen.getAllByText('Courrier');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  test('Devrait afficher badge "Colis" pour type package', async () => {
    render(<Notifications />);
    
    await waitFor(() => {
      // Le bouton filtre + le badge dans la carte
      const colisElements = screen.getAllByText('Colis');
      expect(colisElements.length).toBeGreaterThan(0);
    });
  });

  test('Devrait afficher badge "Alerte" pour type alert', async () => {
    render(<Notifications />);
    
    await waitFor(() => {
      expect(screen.getByText('Alerte')).toBeInTheDocument();
    });
  });

});

// ==================== TESTS: ERREUR API ====================

describe('Notifications - Gestion des erreurs', () => {

  test('Devrait gérer une erreur API gracieusement', async () => {
    server.use(
      http.get(`${API_URL}/api/notifications`, () => {
        return HttpResponse.error();
      })
    );

    render(<Notifications />);

    // Le composant devrait quand même se rendre sans crash
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument();
    });
  });

});
