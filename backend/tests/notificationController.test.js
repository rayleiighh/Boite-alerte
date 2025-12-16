// backend/tests/notificationController.test.js
// Tests pour le système de notifications (Saad)

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Notification = require('../src/models/Notification');
const Event = require('../src/models/Event');
const User = require('../src/models/User');
const notificationController = require('../src/controllers/notificationController');

// Setup Express app pour tests
const app = express();
app.use(express.json());

// Routes de test
app.get('/api/notifications', notificationController.getNotifications);
app.post('/api/notifications', notificationController.createNotification);
app.post('/api/notifications/:id/read', notificationController.markOneRead);
app.post('/api/notifications/mark-all-read', notificationController.markAllRead);
app.delete('/api/notifications/:id', notificationController.deleteOne);

// ==================== DONNÉES DE TEST ====================

const testNotifications = [
  {
    type: 'mail',
    title: 'Nouvelle lettre reçue',
    description: 'Courrier standard déposé',
    timestamp: new Date('2025-12-06T14:00:00Z'),
    deviceID: 'ESP32-001',
    isNew: true
  },
  {
    type: 'package',
    title: 'Colis détecté',
    description: 'Colis en attente de récupération',
    timestamp: new Date('2025-12-05T10:00:00Z'),
    deviceID: 'ESP32-001',
    isNew: true
  },
  {
    type: 'mail',
    title: 'Courrier collecté',
    description: 'Le courrier a été récupéré',
    timestamp: new Date('2025-12-04T16:00:00Z'),
    deviceID: 'ESP32-001',
    isNew: false
  },
  {
    type: 'alert',
    title: 'Alerte système',
    description: 'Vérifiez la boîte aux lettres',
    timestamp: new Date('2025-12-03T09:00:00Z'),
    deviceID: 'ESP32-001',
    isNew: false
  }
];

// ==================== GET /api/notifications ====================

describe('NotificationController - GET /api/notifications', () => {

  beforeEach(async () => {
    await Notification.insertMany(testNotifications);
  });

  test('Devrait retourner toutes les notifications', async () => {
    const res = await request(app).get('/api/notifications');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(4);
  });

  test('Devrait retourner les notifications triées par date décroissante', async () => {
    const res = await request(app).get('/api/notifications');

    expect(res.status).toBe(200);
    
    // Vérifier l'ordre décroissant
    for (let i = 0; i < res.body.length - 1; i++) {
      const currentDate = new Date(res.body[i].timestamp);
      const nextDate = new Date(res.body[i + 1].timestamp);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });

  test('Devrait retourner les champs requis pour chaque notification', async () => {
    const res = await request(app).get('/api/notifications');

    expect(res.status).toBe(200);
    
    const notification = res.body[0];
    expect(notification).toHaveProperty('id');
    expect(notification).toHaveProperty('type');
    expect(notification).toHaveProperty('title');
    expect(notification).toHaveProperty('description');
    expect(notification).toHaveProperty('time');
    expect(notification).toHaveProperty('isNew');
  });

  test('Devrait retourner un tableau vide si aucune notification', async () => {
    await Notification.deleteMany({});

    const res = await request(app).get('/api/notifications');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

});

// ==================== POST /api/notifications ====================

describe('NotificationController - POST /api/notifications', () => {

  test('Devrait créer une notification avec les champs requis', async () => {
    const notificationData = {
      type: 'courrier',
      timestamp: new Date().toISOString(),
      deviceID: 'ESP32-001'
    };

    const res = await request(app)
      .post('/api/notifications')
      .send(notificationData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('notification');
    expect(res.body).toHaveProperty('event');
  });

  test('Devrait retourner 400 si type manquant', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Devrait retourner 400 si timestamp manquant', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: 'courrier',
        deviceID: 'ESP32-001'
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Devrait retourner 400 si deviceID manquant', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: 'courrier',
        timestamp: new Date().toISOString()
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('Devrait mapper "courrier" vers type "mail"', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    expect(res.status).toBe(201);

    const notification = await Notification.findById(res.body.notification);
    expect(notification.type).toBe('mail');
  });

  test('Devrait mapper "colis" vers type "package"', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: 'colis',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    expect(res.status).toBe(201);

    const notification = await Notification.findById(res.body.notification);
    expect(notification.type).toBe('package');
  });

  test('Devrait mapper "alerte" vers type "alert"', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: 'alerte',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    expect(res.status).toBe(201);

    const notification = await Notification.findById(res.body.notification);
    expect(notification.type).toBe('alert');
  });

  test('Devrait créer un Event ET une Notification', async () => {
    const countEventsBefore = await Event.countDocuments();
    const countNotifsBefore = await Notification.countDocuments();

    await request(app)
      .post('/api/notifications')
      .send({
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    const countEventsAfter = await Event.countDocuments();
    const countNotifsAfter = await Notification.countDocuments();

    expect(countEventsAfter).toBe(countEventsBefore + 1);
    expect(countNotifsAfter).toBe(countNotifsBefore + 1);
  });

  test('Devrait définir isNew à true pour nouvelle notification', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    expect(res.status).toBe(201);

    const notification = await Notification.findById(res.body.notification);
    expect(notification.isNew).toBe(true);
  });

  test('Devrait générer le bon titre pour type mail', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    const notification = await Notification.findById(res.body.notification);
    expect(notification.title).toBe('Nouvelle lettre reçue');
  });

  test('Devrait générer le bon titre pour type package', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: 'colis',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    const notification = await Notification.findById(res.body.notification);
    expect(notification.title).toBe('Colis détecté');
  });

});

// ==================== POST /api/notifications/:id/read ====================

describe('NotificationController - POST /api/notifications/:id/read', () => {

  test('Devrait marquer une notification comme lue', async () => {
    const notification = await Notification.create({
      type: 'mail',
      title: 'Test',
      description: 'Test',
      timestamp: new Date(),
      deviceID: 'ESP32-001',
      isNew: true
    });

    const res = await request(app)
      .post(`/api/notifications/${notification._id}/read`);

    expect(res.status).toBe(200);

    const updated = await Notification.findById(notification._id);
    expect(updated.isNew).toBe(false);
  });

  test('Devrait retourner 404 pour notification inexistante', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post(`/api/notifications/${fakeId}/read`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('Ne devrait pas modifier une notification déjà lue', async () => {
    const notification = await Notification.create({
      type: 'mail',
      title: 'Test',
      description: 'Test',
      timestamp: new Date(),
      deviceID: 'ESP32-001',
      isNew: false
    });

    const res = await request(app)
      .post(`/api/notifications/${notification._id}/read`);

    expect(res.status).toBe(200);

    const updated = await Notification.findById(notification._id);
    expect(updated.isNew).toBe(false);
  });

});

// ==================== POST /api/notifications/mark-all-read ====================

describe('NotificationController - POST /api/notifications/mark-all-read', () => {

  beforeEach(async () => {
    await Notification.insertMany(testNotifications);
  });

  test('Devrait marquer toutes les notifications comme lues', async () => {
    const res = await request(app)
      .post('/api/notifications/mark-all-read');

    expect(res.status).toBe(200);

    const unreadCount = await Notification.countDocuments({ isNew: true });
    expect(unreadCount).toBe(0);
  });

  test('Devrait fonctionner même si aucune notification non lue', async () => {
    await Notification.updateMany({}, { isNew: false });

    const res = await request(app)
      .post('/api/notifications/mark-all-read');

    expect(res.status).toBe(200);
  });

});

// ==================== DELETE /api/notifications/:id ====================

describe('NotificationController - DELETE /api/notifications/:id', () => {

  test('Devrait supprimer une notification', async () => {
    const notification = await Notification.create({
      type: 'mail',
      title: 'À supprimer',
      description: 'Test',
      timestamp: new Date(),
      deviceID: 'ESP32-001',
      isNew: true
    });

    const res = await request(app)
      .delete(`/api/notifications/${notification._id}`);

    expect(res.status).toBe(200);

    const deleted = await Notification.findById(notification._id);
    expect(deleted).toBeNull();
  });

  test('Devrait retourner 404 pour notification inexistante', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/notifications/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  test('Ne devrait PAS supprimer l\'event associé (historique conservé)', async () => {
    // Créer via l'API pour avoir event + notification liés
    const createRes = await request(app)
      .post('/api/notifications')
      .send({
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    const notificationId = createRes.body.notification;
    const eventId = createRes.body.event;

    // Supprimer la notification
    await request(app)
      .delete(`/api/notifications/${notificationId}`);

    // Vérifier que l'event existe toujours
    const event = await Event.findById(eventId);
    expect(event).not.toBeNull();
  });

});

// ==================== ENVOI D'EMAILS ====================

describe('NotificationController - Envoi d\'emails', () => {

  test('Devrait retourner emailsSent dans la réponse', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('emailsSent');
    expect(typeof res.body.emailsSent).toBe('number');
  });

  test('Devrait envoyer 0 emails si aucun utilisateur inscrit', async () => {
    await User.deleteMany({});

    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    expect(res.body.emailsSent).toBe(0);
  });

  test('Devrait compter uniquement les utilisateurs actifs', async () => {
    await User.deleteMany({});
    await User.insertMany([
      { email: 'actif@test.com', active: true },
      { email: 'inactif@test.com', active: false }
    ]);

    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: 'courrier',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    // Seulement 1 utilisateur actif
    expect(res.body.emailsSent).toBe(1);
  });

});

// ==================== CAS LIMITES ====================

describe('NotificationController - Cas limites', () => {

  test('Devrait gérer un type inconnu en le mappant vers mail', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: 'type_inconnu',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    expect(res.status).toBe(201);

    const notification = await Notification.findById(res.body.notification);
    expect(notification.type).toBe('mail');
  });

  test('Devrait gérer les majuscules dans le type', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: 'COURRIER',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    expect(res.status).toBe(201);

    const notification = await Notification.findById(res.body.notification);
    expect(notification.type).toBe('mail');
  });

  test('Devrait gérer le type avec espaces', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({
        type: ' colis ',
        timestamp: new Date().toISOString(),
        deviceID: 'ESP32-001'
      });

    expect(res.status).toBe(201);
  });

});