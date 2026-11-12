import request from 'supertest';
import { app } from '../src/app.js';

describe('artisan discovery', () => {
  it('responds to artisan listing query', async () => {
    const response = await request(app).get('/api/v1/artisans?skill=plumbing&location=Buea&page=1&limit=12');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
