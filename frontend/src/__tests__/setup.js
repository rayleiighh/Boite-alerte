import '@testing-library/jest-dom';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Nettoyer après chaque test
afterEach(() => {
  cleanup();
});

// ========== MOCK API HANDLERS ==========
export const mockEvents = [
  { _id: '1', type: 'courrier', timestamp: '2025-12-06T15:00:00Z', deviceID: 'esp32-001' },
  { _id: '2', type: 'colis', timestamp: '2025-12-05T14:00:00Z', deviceID: 'esp32-002' },
  { _id: '3', type: 'ouverture', timestamp: '2025-12-04T13:00:00Z', deviceID: 'esp32-001' },
  { _id: '4', type: 'courrier', timestamp: '2025-12-03T12:00:00Z', deviceID: 'esp32-002' },
  { _id: '5', type: 'colis', timestamp: '2025-12-02T11:00:00Z', deviceID: 'esp32-001' },
  { _id: '6', type: 'courrier', timestamp: '2025-12-01T10:00:00Z', deviceID: 'esp32-001' },
];

export const handlers = [
  // GET /api/events - Liste des événements avec pagination et filtres
  http.get('*/api/events', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 5;
    const type = url.searchParams.get('type');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const search = url.searchParams.get('search');

    let filteredEvents = [...mockEvents];

    // Filtrage par type
    if (type && type !== 'all') {
      filteredEvents = filteredEvents.filter(e => e.type === type);
    }

    // Filtrage par date
    if (startDate) {
      filteredEvents = filteredEvents.filter(
        e => new Date(e.timestamp) >= new Date(startDate)
      );
    }
    if (endDate) {
      filteredEvents = filteredEvents.filter(
        e => new Date(e.timestamp) <= new Date(endDate)
      );
    }

    // Recherche textuelle
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter(
        e => e.type.toLowerCase().includes(searchLower) ||
             e.deviceID.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const total = filteredEvents.length;
    const start = (page - 1) * limit;
    const paginatedEvents = filteredEvents.slice(start, start + limit);

    return HttpResponse.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      events: paginatedEvents,
    });
  }),

  // DELETE /api/events/:id
  http.delete('*/api/events/:id', ({ params }) => {
    const { id } = params;
    const eventIndex = mockEvents.findIndex(e => e._id === id);
    
    if (eventIndex === -1) {
      return HttpResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    return HttpResponse.json({ success: true, message: 'Événement supprimé' });
  }),
];

// Créer le serveur MSW
export const server = setupServer(...handlers);

// Démarrer le serveur avant tous les tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

// Reset les handlers après chaque test
afterEach(() => server.resetHandlers());

// Arrêter le serveur après tous les tests
afterAll(() => server.close());
