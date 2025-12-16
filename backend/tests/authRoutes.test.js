const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');

const User = require('../src/models/User');
const MainUser = require('../src/models/MainUser');
const authRoutes = require('../src/routes/authRoutes');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

// Create a small express app mounting the auth routes
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {

	describe('GET /auth/me', () => {
		test('CA1: sans token -> 401 Token manquant', async () => {
			const res = await request(app).get('/auth/me');
			expect(res.status).toBe(401);
			expect(res.body).toHaveProperty('error', 'Token manquant');
		});

		test('CA2: token invalide -> 401 Token invalide', async () => {
			const res = await request(app)
				.get('/auth/me')
				.set('Authorization', 'Bearer invalid.token');

			expect(res.status).toBe(401);
			expect(res.body).toHaveProperty('error', 'Token invalide');
		});

		test('CA3: token valide mais utilisateur introuvable -> 404', async () => {
			const fakeId = '000000000000000000000000';
			const token = jwt.sign({ userId: fakeId }, process.env.JWT_SECRET);

			const res = await request(app)
				.get('/auth/me')
				.set('Authorization', `Bearer ${token}`);

			expect(res.status).toBe(404);
			expect(res.body).toHaveProperty('error', 'Utilisateur introuvable');
		});

		test('CA4: token valide et utilisateur présent -> 200 et profil', async () => {
			const user = await User.create({ email: 'test@example.com', active: true, deviceID: 'ESP123' });
			const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

			const res = await request(app)
				.get('/auth/me')
				.set('Authorization', `Bearer ${token}`);

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('email', 'test@example.com');
			expect(res.body).toHaveProperty('active', true);
			expect(res.body).toHaveProperty('deviceID', 'ESP123');
			expect(res.body).toHaveProperty('hashAlgorithm', 'argon2id');
		});
	});

	describe('POST /auth/login', () => {
		test("CA1: champs manquants -> 400", async () => {
			const res = await request(app).post('/auth/login').send({});
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', "Nom d'utilisateur et mot de passe requis");
		});

		test('CA2: identifiants incorrects (utilisateur inconnu) -> 401', async () => {
			const res = await request(app).post('/auth/login').send({ username: 'nouser', password: 'pwd' });
			expect(res.status).toBe(401);
			expect(res.body).toHaveProperty('message', 'Identifiants incorrects');
		});

		test('CA3: succès -> renvoie token et met à jour lastLogin', async () => {
			const passwordHash = await argon2.hash('SuperSecret1');
			const admin = await MainUser.create({ username: 'admin', password: passwordHash });

			const res = await request(app).post('/auth/login').send({ username: 'admin', password: 'SuperSecret1' });
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('token');

			const fresh = await MainUser.findById(admin._id);
			expect(fresh.lastLogin).toBeTruthy();
		});
	});

	describe('POST /auth/change-password', () => {
		test('CA1: sans Authorization -> 401 Token manquant', async () => {
			const res = await request(app).post('/auth/change-password').send({});
			expect(res.status).toBe(401);
			expect(res.body).toHaveProperty('message', 'Token manquant');
		});

		test('CA2: token invalide -> 401 Token invalide', async () => {
			const res = await request(app)
				.post('/auth/change-password')
				.set('Authorization', 'Bearer bad.token')
				.send({});

			expect(res.status).toBe(401);
			expect(res.body).toHaveProperty('message', 'Token invalide');
		});

		test('CA3: cas d\'échec et de succès pour changement de mot de passe', async () => {
			// Créer un MainUser
			const passwordHash = await argon2.hash('OldPass123');
			const admin = await MainUser.create({ username: 'chguser', password: passwordHash });

			const token = jwt.sign({ userId: admin._id, username: admin.username }, process.env.JWT_SECRET);

			// Champs manquants
			let res = await request(app).post('/auth/change-password').set('Authorization', `Bearer ${token}`).send({});
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', 'Champs manquants');

			// Mots de passe ne correspondent pas
			res = await request(app).post('/auth/change-password').set('Authorization', `Bearer ${token}`).send({ currentPassword: 'OldPass123', newPassword: 'NewPass123', confirmPassword: 'Mismatch' });
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message', "Les mots de passe ne correspondent pas");

			// Mot de passe trop faible
			res = await request(app).post('/auth/change-password').set('Authorization', `Bearer ${token}`).send({ currentPassword: 'OldPass123', newPassword: 'short', confirmPassword: 'short' });
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty('message');

			// Mauvais current password
			res = await request(app).post('/auth/change-password').set('Authorization', `Bearer ${token}`).send({ currentPassword: 'WrongOld', newPassword: 'NewStrong1', confirmPassword: 'NewStrong1' });
			expect(res.status).toBe(401);
			expect(res.body).toHaveProperty('message', 'Mot de passe actuel incorrect');

			// Succès
			res = await request(app).post('/auth/change-password').set('Authorization', `Bearer ${token}`).send({ currentPassword: 'OldPass123', newPassword: 'NewStrong1', confirmPassword: 'NewStrong1' });
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('message', 'Mot de passe modifié. Reconnexion requise.');

			const updated = await MainUser.findById(admin._id);
			expect(updated.lastPasswordChange).toBeTruthy();
			const ok = await argon2.verify(updated.password, 'NewStrong1');
			expect(ok).toBe(true);
		});
	});

});
