import { describe, test, expect, vi, beforeEach } from 'vitest';
import { fetchEvents, deleteEvent } from '../services/events';

// Note: Les appels API sont mockés par MSW dans setup.js

describe('Events Service - API calls', () => {
  
  describe('fetchEvents', () => {
    
    test('Retourne les événements avec la structure attendue', async () => {
      const result = await fetchEvents({ page: 1, limit: 5 });
      
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('totalPages');
      expect(Array.isArray(result.items)).toBe(true);
    });

    test('Applique les valeurs par défaut (page=1, limit=5)', async () => {
      const result = await fetchEvents({});
      
      expect(result.items.length).toBeLessThanOrEqual(5);
    });

    test('Filtre par type correctement', async () => {
      const result = await fetchEvents({ type: 'courrier' });
      
      result.items.forEach(event => {
        expect(event.type).toBe('courrier');
      });
    });

    test('Ignore le filtre type="all"', async () => {
      const result = await fetchEvents({ type: 'all' });
      
      // Devrait retourner tous les types
      expect(result.total).toBeGreaterThan(0);
    });

    test('Applique la pagination correctement', async () => {
      const page1 = await fetchEvents({ page: 1, limit: 2 });
      const page2 = await fetchEvents({ page: 2, limit: 2 });
      
      // Les IDs doivent être différents entre les pages
      const page1Ids = page1.items.map(e => e._id);
      const page2Ids = page2.items.map(e => e._id);
      
      page1Ids.forEach(id => {
        expect(page2Ids).not.toContain(id);
      });
    });

    test('Envoie les paramètres de recherche', async () => {
      const result = await fetchEvents({ search: 'esp32-002' });
      
      result.items.forEach(event => {
        expect(event.deviceID).toBe('esp32-002');
      });
    });

    test('Envoie les paramètres de date', async () => {
      const result = await fetchEvents({ 
        dateStart: '2025-12-05', 
        dateEnd: '2025-12-06' 
      });
      
      result.items.forEach(event => {
        const eventDate = new Date(event.timestamp);
        expect(eventDate >= new Date('2025-12-05')).toBe(true);
        expect(eventDate <= new Date('2025-12-06T23:59:59')).toBe(true);
      });
    });
  });

  describe('deleteEvent', () => {
    
    test('Supprime un événement existant avec succès', async () => {
      const result = await deleteEvent('1');
      
      expect(result.success).toBe(true);
    });

    test('Retourne une erreur pour un ID inexistant', async () => {
      try {
        await deleteEvent('inexistant');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });
});
