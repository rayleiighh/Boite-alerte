const MainUser = require('../src/models/MainUser');

describe('MainUser model', () => {
  test('créer un MainUser avec les champs requis', async () => {
    const user = await MainUser.create({ username: 'tester', password: 'Pwd12345' });
    expect(user).toBeDefined();
    expect(user.username).toBe('tester');
    expect(user.password).toBe('Pwd12345');
  });

  test('role et active ont des valeurs par défaut', async () => {
    const user = await MainUser.create({ username: 'defaults', password: 'Pwd12345' });
    expect(user.role).toBe('admin');
    expect(user.active).toBe(true);
  });

  test('timestamps sont définis', async () => {
    const user = await MainUser.create({ username: 'timeuser', password: 'Pwd12345' });
    expect(user.createdAt).toBeTruthy();
    expect(user.updatedAt).toBeTruthy();
  });

  test('username est requis', async () => {
    await expect(MainUser.create({ password: 'Pwd12345' })).rejects.toThrow();
  });

  test('password est requis', async () => {
    await expect(MainUser.create({ username: 'nopwd' })).rejects.toThrow();
  });

  test('username doit être unique', async () => {
    await MainUser.create({ username: 'uniqueuser', password: 'Pwd12345' });
    await expect(MainUser.create({ username: 'uniqueuser', password: 'OtherPwd1' })).rejects.toHaveProperty('code', 11000);
  });

  test('mise à jour de lastLogin et lastPasswordChange', async () => {
    const user = await MainUser.create({ username: 'upduser', password: 'Pwd12345' });
    user.lastLogin = new Date();
    user.lastPasswordChange = new Date();
    await user.save();

    const fresh = await MainUser.findById(user._id);
    expect(fresh.lastLogin).toBeTruthy();
    expect(fresh.lastPasswordChange).toBeTruthy();
  });
});
