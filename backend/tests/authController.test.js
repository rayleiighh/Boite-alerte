const { login, changePassword } = require('../src/controllers/authController');
const MainUser = require('../src/models/MainUser');
const argon2 = require('argon2');

// helper to create mocked res
function createRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authController (unit)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('login()', () => {
    test('retourne 400 quand username/password manquant', async () => {
      const req = { body: {} };
      const res = createRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Nom d'utilisateur et mot de passe requis" });
    });

    test("retourne 401 quand l'utilisateur est introuvable", async () => {
      jest.spyOn(MainUser, 'findOne').mockResolvedValue(null);

      const req = { body: { username: 'nope', password: 'pwd' } };
      const res = createRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Identifiants incorrects' });
    });

    test('retourne 401 quand le mot de passe est invalide', async () => {
      const fakeUser = { username: 'admin', password: 'hash' };
      jest.spyOn(MainUser, 'findOne').mockResolvedValue(fakeUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      const req = { body: { username: 'admin', password: 'bad' } };
      const res = createRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Identifiants incorrects' });
    });

    test('succès: renvoie token et met à jour lastLogin', async () => {
      const fakeUser = {
        _id: 'u1',
        username: 'admin',
        password: 'hash',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(MainUser, 'findOne').mockResolvedValue(fakeUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);
      jest.spyOn(require('jsonwebtoken'), 'sign').mockReturnValue('tok');

      const req = { body: { username: 'admin', password: 'SuperSecret1' } };
      const res = createRes();

      await login(req, res);

      expect(fakeUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ token: 'tok' });
    });
  });

  describe('changePassword()', () => {
    test('400 quand champs manquants', async () => {
      const req = { body: {}, user: { userId: 'u1' } };
      const res = createRes();

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Champs manquants' });
    });

    test('400 quand confirmPassword diffère', async () => {
      const req = { body: { currentPassword: 'a', newPassword: 'Aaaa1111', confirmPassword: 'no' }, user: { userId: 'u1' } };
      const res = createRes();

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Les mots de passe ne correspondent pas' });
    });

    test('400 quand mot de passe trop faible', async () => {
      const req = { body: { currentPassword: 'a', newPassword: 'short', confirmPassword: 'short' }, user: { userId: 'u1' } };
      const res = createRes();

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe trop faible (8 caractères minimum, 1 chiffre)' });
    });

    test('404 quand utilisateur introuvable', async () => {
      jest.spyOn(MainUser, 'findById').mockResolvedValue(null);

      const req = { body: { currentPassword: 'a', newPassword: 'NewPass1', confirmPassword: 'NewPass1' }, user: { userId: 'u1' } };
      const res = createRes();

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur introuvable' });
    });

    test('401 quand currentPassword incorrect', async () => {
      const fakeUser = { password: 'hash' };
      jest.spyOn(MainUser, 'findById').mockResolvedValue(fakeUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(false);

      const req = { body: { currentPassword: 'wrong', newPassword: 'NewStrong1', confirmPassword: 'NewStrong1' }, user: { userId: 'u1' } };
      const res = createRes();

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe actuel incorrect' });
    });

    test('succès: hash nouveau mot de passe et mise à jour', async () => {
      const fakeUser = { password: 'oldhash', save: jest.fn().mockResolvedValue(true) };
      jest.spyOn(MainUser, 'findById').mockResolvedValue(fakeUser);
      jest.spyOn(argon2, 'verify').mockResolvedValue(true);
      jest.spyOn(argon2, 'hash').mockResolvedValue('newhash');

      const req = { body: { currentPassword: 'OldPass123', newPassword: 'NewStrong1', confirmPassword: 'NewStrong1' }, user: { userId: 'u1' } };
      const res = createRes();

      await changePassword(req, res);

      expect(argon2.hash).toHaveBeenCalled();
      expect(fakeUser.password).toBe('newhash');
      expect(fakeUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe modifié. Reconnexion requise.' });
    });
  });
});
