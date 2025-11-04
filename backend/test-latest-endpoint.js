// Script de test pour l'endpoint /events/latest
// Usage: node test-latest-endpoint.js

const http = require('http');

const API_BASE = 'http://localhost:4000';

function testLatestEndpoint() {
  console.log('🧪 Test de l\'endpoint /api/events/latest...\n');

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/events/latest',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`📡 Status: ${res.statusCode}`);
      console.log(`📝 Response:`);

      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));

        if (parsed.hasEvent) {
          console.log(`\n✅ État détecté: ${parsed.status}`);
          console.log(`💬 Message: ${parsed.message}`);
        } else {
          console.log(`\n⚪ Aucun événement trouvé`);
        }
      } catch (error) {
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`❌ Erreur: ${error.message}`);
    console.log('\n💡 Assurez-vous que le serveur backend fonctionne sur le port 4000');
  });

  req.end();
}

testLatestEndpoint();
