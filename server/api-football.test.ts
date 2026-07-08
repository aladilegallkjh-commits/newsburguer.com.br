import { describe, it, expect } from 'vitest';

describe('API-Football Integration', () => {
  it('should validate API key by fetching leagues', async () => {
    const apiKey = process.env.RAPIDAPI_KEY;
    
    if (!apiKey) {
      throw new Error('RAPIDAPI_KEY environment variable is not set');
    }

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': 'api-football-v3.p.rapidapi.com',
        'X-RapidAPI-Key': apiKey,
      },
    };

    try {
      const response = await fetch(
        'https://api-football-v3.p.rapidapi.com/fixtures?league=848&season=2026',
        options
      );

      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('response');
      expect(Array.isArray(data.response)).toBe(true);
      
      console.log('✅ API-Football key is valid!');
    } catch (error) {
      console.error('❌ API-Football key validation failed:', error);
      throw error;
    }
  });
});
