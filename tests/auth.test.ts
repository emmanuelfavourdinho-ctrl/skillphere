import request from 'supertest';
import { app } from '../src/app.js';

describe('auth routes', () => {
  it('returns health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('allows registration for a customer', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'user@example.com',
        password: 'verysecret123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'CUSTOMER',
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('user@example.com');
  });
});
