// backend/tests/eventController_enriched.test.js
// Tests pour stats enrichies (Phase 1) - Avec mock db.js

// ========== MOCK db.js AVANT TOUS LES IMPORTS ==========
jest.mock('../src/config/db', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined)
}));

// ========== IMPORTS APRÈS LE MOCK ==========
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Event = require('../src/models/Event');
const eventController = require('../src/controllers/eventController');

// Setup Express app pour tests
const app = express();
app.use(express.json());
app.post('/api/events', eventController.addEvent);
app.get('/api/events/latest', eventController.getLatestEvent);

// Variables globales pour MongoDB Memory Server
let mongoServer;

describe('EventController - Stats Enrichies (Phase 1)', () => {
  
  // ========== SETUP MONGODB MEMORY SERVER ==========
  beforeAll(async () => {
    // Déconnecter Mongoose si déjà connecté
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Créer instance MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connecter à la DB en mémoire
    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB Memory Server connecté pour tests');
  });

  afterAll(async () => {
    // Fermer connexion Mongoose
    await mongoose.disconnect();
    
    // Arrêter MongoDB Memory Server
    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log('✅ MongoDB Memory Server arrêté');
  });

  beforeEach(async () => {
    // Nettoyer collection avant chaque test
    await Event.deleteMany({});
  });

  // ========== TESTS ==========
  describe('POST /api/events - Stats enrichies', () => {
    
    test('Devrait créer event avec toutes les stats enrichies', async () => {
      const eventData = {
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'esp32-mailbox-001',
        weight_g: 25.5,
        rssi: -62,
        beam_state: true,
        uptime_s: 350,
        event_count: 7,
        battery_percent: 80
      };

      const res = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('event');
      
      const event = res.body.event;
      expect(event).toHaveProperty('type', 'courrier');
      expect(event).toHaveProperty('deviceID', 'esp32-mailbox-001');
      expect(event).toHaveProperty('weight_g', 25.5);
      expect(event).toHaveProperty('rssi', -62);
      expect(event).toHaveProperty('beam_state', true);
      expect(event).toHaveProperty('uptime_s', 350);
      expect(event).toHaveProperty('event_count', 7);
      expect(event).toHaveProperty('battery_percent', 80);
    });

    test('Devrait accepter event sans stats enrichies (rétrocompatibilité)', async () => {
      const eventData = {
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'esp32-mailbox-002'
        // Pas de stats enrichies
      };

      const res = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(res.status).toBe(201);
      expect(res.body.event).toHaveProperty('type', 'courrier');
      expect(res.body.event).toHaveProperty('weight_g', null);
      expect(res.body.event).toHaveProperty('rssi', null);
      expect(res.body.event).toHaveProperty('beam_state', null);
    });

    test('Devrait accepter event avec seulement certaines stats enrichies', async () => {
      const eventData = {
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'esp32-mailbox-003',
        weight_g: 10.2,
        rssi: -70
        // Autres stats manquantes
      };

      const res = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(res.status).toBe(201);
      expect(res.body.event).toHaveProperty('weight_g', 10.2);
      expect(res.body.event).toHaveProperty('rssi', -70);
      expect(res.body.event).toHaveProperty('beam_state', null);
      expect(res.body.event).toHaveProperty('uptime_s', null);
    });

    test('Devrait gérer idempotence avec stats enrichies', async () => {
      const eventData = {
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'esp32-mailbox-004',
        weight_g: 15.0,
        rssi: -55
      };

      const idempotencyKey = 'esp32-mailbox-004|' + eventData.timestamp;

      // Premier envoi
      const res1 = await request(app)
        .post('/api/events')
        .set('Idempotency-Key', idempotencyKey)
        .send(eventData);

      expect(res1.status).toBe(201);
      expect(res1.body).not.toHaveProperty('cached');

      // Deuxième envoi (même Idempotency-Key)
      const res2 = await request(app)
        .post('/api/events')
        .set('Idempotency-Key', idempotencyKey)
        .send(eventData);

      expect(res2.status).toBe(200);
      expect(res2.body).toHaveProperty('cached', true);
      expect(res2.body.message).toContain('idempotence');
    });

    test('Devrait rejeter event sans champs obligatoires', async () => {
      const eventData = {
        weight_g: 10.0,
        rssi: -60
        // Manque type, timestamp, deviceID
      };

      const res = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/events/latest - Stats enrichies', () => {
    
    test('Devrait retourner dernier event avec stats enrichies', async () => {
      // Créer event avec stats
      const eventData = {
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'esp32-mailbox-005',
        weight_g: 18.7,
        rssi: -58,
        beam_state: true,
        uptime_s: 420,
        event_count: 3,
        battery_percent: 65
      };

      await request(app)
        .post('/api/events')
        .send(eventData);

      // Récupérer dernier event
      const res = await request(app)
        .get('/api/events/latest');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('hasEvent', true);
      expect(res.body).toHaveProperty('lastEvent');
      
      const lastEvent = res.body.lastEvent;
      expect(lastEvent).toHaveProperty('type', 'courrier');
      expect(lastEvent).toHaveProperty('deviceID', 'esp32-mailbox-005');
      expect(lastEvent).toHaveProperty('weight_g', 18.7);
      expect(lastEvent).toHaveProperty('rssi', -58);
      expect(lastEvent).toHaveProperty('beam_state', true);
      expect(lastEvent).toHaveProperty('uptime_s', 420);
      expect(lastEvent).toHaveProperty('event_count', 3);
      expect(lastEvent).toHaveProperty('battery_percent', 65);
    });

    test('Devrait retourner lastEvent null pour stats enrichies si non présentes', async () => {
      // Créer event sans stats enrichies
      const eventData = {
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'esp32-mailbox-006'
      };

      await request(app)
        .post('/api/events')
        .send(eventData);

      const res = await request(app)
        .get('/api/events/latest');

      expect(res.status).toBe(200);
      expect(res.body.lastEvent).toHaveProperty('weight_g', null);
      expect(res.body.lastEvent).toHaveProperty('rssi', null);
      expect(res.body.lastEvent).toHaveProperty('battery_percent', null);
    });

    test('Devrait retourner hasEvent false si aucun event', async () => {
      const res = await request(app)
        .get('/api/events/latest');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('hasEvent', false);
      expect(res.body).toHaveProperty('status', 'empty');
    });
  });

  describe('Validation des types de stats enrichies', () => {
    
    test('weight_g devrait être un nombre', async () => {
      const eventData = {
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'esp32-test',
        weight_g: 12.5
      };

      const res = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(res.status).toBe(201);
      expect(typeof res.body.event.weight_g).toBe('number');
    });

    test('rssi devrait être un nombre négatif (dBm)', async () => {
      const eventData = {
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'esp32-test',
        rssi: -65
      };

      const res = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(res.status).toBe(201);
      expect(res.body.event.rssi).toBeLessThan(0);
    });

    test('beam_state devrait être un booléen', async () => {
      const eventData = {
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'esp32-test',
        beam_state: false
      };

      const res = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(res.status).toBe(201);
      expect(typeof res.body.event.beam_state).toBe('boolean');
    });

    test('uptime_s devrait être un nombre positif', async () => {
      const eventData = {
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'esp32-test',
        uptime_s: 300
      };

      const res = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(res.status).toBe(201);
      expect(res.body.event.uptime_s).toBeGreaterThanOrEqual(0);
    });
  });
});