const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const systemRoutes = require('../src/routes/systemRoutes');
const MainUser = require('../src/models/MainUser');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const app = express();
app.use(express.json());
app.use('/system', systemRoutes);

describe('System Routes - /system/profile', () => {
  test('401 sans token -> Token manquant', async () => {
    const res = await request(app).get('/system/profile');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Token manquant');
  });

  test('401 token invalide -> Token invalide', async () => {
    const res = await request(app).get('/system/profile').set('Authorization', 'Bearer bad.token');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Token invalide');
  });

  test("401 token valide mais utilisateur inexistant -> Utilisateur inexistant", async () => {
    const fakeId = '000000000000000000000000';
    const token = jwt.sign({ userId: fakeId, username: 'ghost' }, process.env.JWT_SECRET);

    const res = await request(app).get('/system/profile').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Utilisateur inexistant');
  });

  test('200 token valide et utilisateur présent -> retourne le profil', async () => {
    const user = await MainUser.create({ username: 'sysadmin', password: 'Pwd12345', email: 'admin@local' });
    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET);

    const res = await request(app).get('/system/profile').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username', 'sysadmin');
    expect(res.body).toHaveProperty('email', 'admin@local');
    expect(res.body).toHaveProperty('active');
    expect(res.body).toHaveProperty('backend', 'ok');
    expect(res.body).toHaveProperty('mongo');
    expect(res.body).toHaveProperty('uptime');
  });
});
