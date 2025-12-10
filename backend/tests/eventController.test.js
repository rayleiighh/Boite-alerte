const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Event = require('../src/models/Event');
const eventController = require('../src/controllers/eventController');

// Créer une app Express de test
const app = express();
app.use(express.json());

// Routes de test (uniquement celles de l'historique)
app.get('/api/events', eventController.getEvents);
app.delete('/api/events/:id', eventController.deleteEvent);

describe('EventController - Historique (US #30, #31, #32)', () => {
  
  // ========== DONNÉES DE TEST ==========
  const testEvents = [
    { type: 'courrier', timestamp: new Date('2025-12-01T10:00:00Z'), deviceID: 'esp32-001' },
    { type: 'colis', timestamp: new Date('2025-12-02T11:00:00Z'), deviceID: 'esp32-001' },
    { type: 'ouverture', timestamp: new Date('2025-12-03T12:00:00Z'), deviceID: 'esp32-001' },
    { type: 'courrier', timestamp: new Date('2025-12-04T13:00:00Z'), deviceID: 'esp32-002' },
    { type: 'colis', timestamp: new Date('2025-12-05T14:00:00Z'), deviceID: 'esp32-002' },
    { type: 'courrier', timestamp: new Date('2025-12-06T15:00:00Z'), deviceID: 'esp32-001' },
  ];

  beforeEach(async () => {
    // Insérer les données de test avant chaque test
    await Event.insertMany(testEvents);
  });

  // ========== US #30 : AFFICHAGE LISTE DES ÉVÉNEMENTS ==========
  describe('US #30 - Affichage liste des événements', () => {
    
    test('CA1: GET /api/events renvoie les événements depuis MongoDB', async () => {
      const res = await request(app).get('/api/events');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('events');
      expect(Array.isArray(res.body.events)).toBe(true);
      expect(res.body.events.length).toBeGreaterThan(0);
    });

    test('CA2: Les événements sont triés par date décroissante', async () => {
      const res = await request(app).get('/api/events');
      
      expect(res.status).toBe(200);
      const events = res.body.events;
      
      // Vérifier que chaque événement est plus récent que le suivant
      for (let i = 0; i < events.length - 1; i++) {
        const currentDate = new Date(events[i].timestamp);
        const nextDate = new Date(events[i + 1].timestamp);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });

    test('La réponse contient les champs requis (type, timestamp, deviceID)', async () => {
      const res = await request(app).get('/api/events');
      
      expect(res.status).toBe(200);
      const event = res.body.events[0];
      
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('timestamp');
      expect(event).toHaveProperty('deviceID');
    });
  });

  // ========== US #31 : FILTRAGE DES ÉVÉNEMENTS ==========
  describe('US #31 - Filtrage des événements', () => {
    
    test('CA3: Filtrage par type fonctionne', async () => {
      const res = await request(app).get('/api/events?type=courrier');
      
      expect(res.status).toBe(200);
      expect(res.body.events.length).toBe(3); // 3 courriers dans testEvents
      res.body.events.forEach(event => {
        expect(event.type).toBe('courrier');
      });
    });

    test('Filtrage par type "colis" fonctionne', async () => {
      const res = await request(app).get('/api/events?type=colis');
      
      expect(res.status).toBe(200);
      expect(res.body.events.length).toBe(2); // 2 colis dans testEvents
      res.body.events.forEach(event => {
        expect(event.type).toBe('colis');
      });
    });

    test('Filtrage par type "ouverture" fonctionne', async () => {
      const res = await request(app).get('/api/events?type=ouverture');
      
      expect(res.status).toBe(200);
      expect(res.body.events.length).toBe(1); // 1 ouverture dans testEvents
    });

    test('Filtrage par type "all" renvoie tous les événements', async () => {
      const res = await request(app).get('/api/events?type=all');
      
      expect(res.status).toBe(200);
      expect(res.body.events.length).toBe(6); // Tous les événements
    });

    test('CA3: Filtrage par date de début fonctionne', async () => {
      const res = await request(app).get('/api/events?startDate=2025-12-04');
      
      expect(res.status).toBe(200);
      res.body.events.forEach(event => {
        expect(new Date(event.timestamp).getTime()).toBeGreaterThanOrEqual(
          new Date('2025-12-04').getTime()
        );
      });
    });

    test('CA3: Filtrage par date de fin fonctionne', async () => {
      const res = await request(app).get('/api/events?endDate=2025-12-03');
      
      expect(res.status).toBe(200);
      res.body.events.forEach(event => {
        expect(new Date(event.timestamp).getTime()).toBeLessThanOrEqual(
          new Date('2025-12-03').getTime()
        );
      });
    });

    test('CA3: Filtrage par plage de dates (startDate + endDate) fonctionne', async () => {
      const res = await request(app).get('/api/events?startDate=2025-12-02&endDate=2025-12-04');
      
      expect(res.status).toBe(200);
      expect(res.body.events.length).toBeGreaterThan(0);
      res.body.events.forEach(event => {
        const eventDate = new Date(event.timestamp).getTime();
        expect(eventDate).toBeGreaterThanOrEqual(new Date('2025-12-02').getTime());
        expect(eventDate).toBeLessThanOrEqual(new Date('2025-12-04').getTime());
      });
    });

    test('Filtrage combiné type + dates fonctionne', async () => {
      const res = await request(app).get('/api/events?type=courrier&startDate=2025-12-04');
      
      expect(res.status).toBe(200);
      res.body.events.forEach(event => {
        expect(event.type).toBe('courrier');
        expect(new Date(event.timestamp).getTime()).toBeGreaterThanOrEqual(
          new Date('2025-12-04').getTime()
        );
      });
    });

    test('Recherche textuelle par deviceID fonctionne', async () => {
      const res = await request(app).get('/api/events?search=esp32-002');
      
      expect(res.status).toBe(200);
      expect(res.body.events.length).toBe(2); // 2 events de esp32-002
      res.body.events.forEach(event => {
        expect(event.deviceID).toBe('esp32-002');
      });
    });

    test('Recherche textuelle par type fonctionne', async () => {
      const res = await request(app).get('/api/events?search=colis');
      
      expect(res.status).toBe(200);
      res.body.events.forEach(event => {
        expect(event.type.toLowerCase()).toContain('colis');
      });
    });
  });

  // ========== US #32 : PAGINATION DE L'HISTORIQUE ==========
  describe('US #32 - Pagination de l\'historique', () => {
    
    test('CA4: La pagination renvoie le bon nombre d\'éléments par page', async () => {
      const res = await request(app).get('/api/events?page=1&limit=2');
      
      expect(res.status).toBe(200);
      expect(res.body.events.length).toBe(2);
      expect(res.body.limit).toBe(2);
    });

    test('CA4: La pagination renvoie la bonne page', async () => {
      const res = await request(app).get('/api/events?page=2&limit=2');
      
      expect(res.status).toBe(200);
      expect(res.body.page).toBe(2);
      expect(res.body.events.length).toBe(2);
    });

    test('CA4: La pagination calcule correctement le total de pages', async () => {
      const res = await request(app).get('/api/events?limit=2');
      
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(6);
      expect(res.body.totalPages).toBe(3); // 6 events / 2 par page = 3 pages
    });

    test('CA4: Navigation entre pages sans perte de données', async () => {
      const page1 = await request(app).get('/api/events?page=1&limit=3');
      const page2 = await request(app).get('/api/events?page=2&limit=3');
      
      expect(page1.status).toBe(200);
      expect(page2.status).toBe(200);
      
      // Vérifier que les événements sont différents entre les pages
      const page1Ids = page1.body.events.map(e => e._id);
      const page2Ids = page2.body.events.map(e => e._id);
      
      page1Ids.forEach(id => {
        expect(page2Ids).not.toContain(id);
      });
      
      // Vérifier qu'on a bien tous les événements au total
      expect(page1.body.events.length + page2.body.events.length).toBe(6);
    });

    test('La réponse JSON contient les métadonnées de pagination', async () => {
      const res = await request(app).get('/api/events?page=1&limit=5');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('events');
    });

    test('Page par défaut est 1 si non spécifiée', async () => {
      const res = await request(app).get('/api/events?limit=2');
      
      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
    });

    test('Limit par défaut est 10 si non spécifié', async () => {
      const res = await request(app).get('/api/events');
      
      expect(res.status).toBe(200);
      expect(res.body.limit).toBe(10);
    });
  });

  // ========== SUPPRESSION D'ÉVÉNEMENT ==========
  describe('Suppression d\'événement', () => {
    
    test('DELETE /api/events/:id supprime un événement existant', async () => {
      // Récupérer un événement existant
      const events = await Event.find();
      const eventToDelete = events[0];
      
      const res = await request(app).delete(`/api/events/${eventToDelete._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      // Vérifier que l'événement n'existe plus
      const deletedEvent = await Event.findById(eventToDelete._id);
      expect(deletedEvent).toBeNull();
    });

    test('DELETE /api/events/:id renvoie 404 pour un ID inexistant', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const res = await request(app).delete(`/api/events/${fakeId}`);
      
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    test('DELETE /api/events/:id renvoie 500 pour un ID invalide', async () => {
      const res = await request(app).delete('/api/events/invalid-id');
      
      expect(res.status).toBe(500);
    });
  });

  // ========== CAS LIMITES ==========
  describe('Cas limites', () => {
    
    test('Retourne un tableau vide quand aucun événement ne correspond aux filtres', async () => {
      const res = await request(app).get('/api/events?type=inexistant');
      
      expect(res.status).toBe(200);
      expect(res.body.events).toEqual([]);
      expect(res.body.total).toBe(0);
    });

    test('Retourne un tableau vide pour une page au-delà du total', async () => {
      const res = await request(app).get('/api/events?page=999&limit=5');
      
      expect(res.status).toBe(200);
      expect(res.body.events).toEqual([]);
    });
  });
});
