const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Avant tous les tests : démarrer MongoDB en mémoire
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Après chaque test : nettoyer la base
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Après tous les tests : fermer les connexions
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
