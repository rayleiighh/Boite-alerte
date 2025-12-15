// backend/tests/heartbeatController.test.js
const request = require('supertest');
const express = require('express');
const heartbeatController = require('../src/controllers/heartbeatController');

// Setup Express app pour tests
const app = express();
app.use(express.json());
app.post('/api/heartbeat', heartbeatController.receiveHeartbeat);
app.get('/api/heartbeat/latest', heartbeatController.getLatestHeartbeat);
app.get('/api/heartbeat/history', heartbeatController.getHeartbeatHistory);

describe('HeartbeatController - POST /api/heartbeat', () => {
  
  test('Devrait accepter heartbeat avec toutes les stats enrichies', async () => {
    const heartbeatData = {
      deviceID: 'esp32-mailbox-001',
      timestamp: new Date().toISOString(),
      uptime_s: 120,
      event_count: 5,
      battery_percent: 85,
      rssi: -65,
      weight_g: 15.5,
      beam_state: false
    };

    const res = await request(app)
      .post('/api/heartbeat')
      .send(heartbeatData);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Heartbeat');
  });

  test('Devrait accepter heartbeat avec champs optionnels manquants', async () => {
    const heartbeatData = {
      deviceID: 'esp32-mailbox-002',
      timestamp: new Date().toISOString()
      // Pas de stats enrichies
    };

    const res = await request(app)
      .post('/api/heartbeat')
      .send(heartbeatData);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Devrait rejeter heartbeat sans deviceID', async () => {
    const heartbeatData = {
      timestamp: new Date().toISOString(),
      uptime_s: 100
    };

    const res = await request(app)
      .post('/api/heartbeat')
      .send(heartbeatData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('deviceID');
  });

  test('Devrait rejeter heartbeat sans timestamp', async () => {
    const heartbeatData = {
      deviceID: 'esp32-mailbox-001',
      uptime_s: 100
    };

    const res = await request(app)
      .post('/api/heartbeat')
      .send(heartbeatData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('timestamp');
  });
});

describe('HeartbeatController - GET /api/heartbeat/latest', () => {
  
  beforeEach(async () => {
    // Envoyer un heartbeat récent (< 60s)
    await request(app)
      .post('/api/heartbeat')
      .send({
        deviceID: 'esp32-test-device',
        timestamp: new Date().toISOString(),
        uptime_s: 300,
        event_count: 10,
        rssi: -55,
        weight_g: 12.3,
        beam_state: true,
        battery_percent: 75
      });
  });

  test('Devrait retourner device connecté si heartbeat < 60s', async () => {
    const res = await request(app)
      .get('/api/heartbeat/latest')
      .query({ deviceID: 'esp32-test-device' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('connected', true);
    expect(res.body).toHaveProperty('ageSeconds');
    expect(res.body.ageSeconds).toBeLessThan(60);
    expect(res.body).toHaveProperty('heartbeat');
    expect(res.body.heartbeat).toHaveProperty('deviceID', 'esp32-test-device');
    expect(res.body.heartbeat).toHaveProperty('uptime_s', 300);
    expect(res.body.heartbeat).toHaveProperty('event_count', 10);
    expect(res.body.heartbeat).toHaveProperty('rssi', -55);
    expect(res.body.heartbeat).toHaveProperty('weight_g', 12.3);
    expect(res.body.heartbeat).toHaveProperty('beam_state', true);
    expect(res.body.heartbeat).toHaveProperty('battery_percent', 75);
  });

  test('Devrait retourner connected false pour device inconnu', async () => {
    const res = await request(app)
      .get('/api/heartbeat/latest')
      .query({ deviceID: 'device-inexistant' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('connected', false);
    expect(res.body).toHaveProperty('lastSeen', null);
  });

  test('Devrait rejeter requête sans deviceID', async () => {
    const res = await request(app)
      .get('/api/heartbeat/latest');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('deviceID');
  });

  test('Devrait calculer ageSeconds correctement', async () => {
    const res = await request(app)
      .get('/api/heartbeat/latest')
      .query({ deviceID: 'esp32-test-device' });

    expect(res.status).toBe(200);
    expect(res.body.ageSeconds).toBeGreaterThanOrEqual(0);
    expect(res.body.ageSeconds).toBeLessThan(10); // Test rapide, devrait être < 10s
  });
});

describe('HeartbeatController - GET /api/heartbeat/history', () => {
  
  beforeEach(async () => {
    // Envoyer plusieurs heartbeats
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/heartbeat')
        .send({
          deviceID: 'esp32-history-test',
          timestamp: new Date(Date.now() - i * 1000).toISOString(),
          uptime_s: 100 + i * 30,
          event_count: i
        });
    }
  });

  test('Devrait retourner historique avec limite par défaut', async () => {
    const res = await request(app)
      .get('/api/heartbeat/history')
      .query({ deviceID: 'esp32-history-test' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('heartbeats');
    expect(Array.isArray(res.body.heartbeats)).toBe(true);
    expect(res.body.heartbeats.length).toBeGreaterThan(0);
    expect(res.body.heartbeats.length).toBeLessThanOrEqual(20); // Limite par défaut
  });

  test('Devrait respecter limite personnalisée', async () => {
    const res = await request(app)
      .get('/api/heartbeat/history')
      .query({ deviceID: 'esp32-history-test', limit: 3 });

    expect(res.status).toBe(200);
    expect(res.body.heartbeats.length).toBeLessThanOrEqual(3);
  });

  test('Devrait filtrer par deviceID', async () => {
    const res = await request(app)
      .get('/api/heartbeat/history')
      .query({ deviceID: 'esp32-history-test' });

    expect(res.status).toBe(200);
    res.body.heartbeats.forEach(h => {
      expect(h.deviceID).toBe('esp32-history-test');
    });
  });

  test('Devrait retourner tous devices si deviceID non spécifié', async () => {
    // Envoyer heartbeat d'un autre device
    await request(app)
      .post('/api/heartbeat')
      .send({
        deviceID: 'esp32-autre-device',
        timestamp: new Date().toISOString(),
        uptime_s: 50
      });

    const res = await request(app)
      .get('/api/heartbeat/history');

    expect(res.status).toBe(200);
    expect(res.body.heartbeats.length).toBeGreaterThan(0);
    
    // Vérifier qu'il y a au moins 2 devices différents
    const deviceIDs = new Set(res.body.heartbeats.map(h => h.deviceID));
    expect(deviceIDs.size).toBeGreaterThan(1);
  });
});