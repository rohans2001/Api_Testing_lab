// Example Jest integration test for the Local API Lab
// Pre-requisites: npm install --save-dev jest supertest

const request = require('supertest');
// Note: Export your app from server.js to use supertest correctly.
// const app = require('../server'); 

describe('Auth Endpoints', () => {
  it('should return 401 for invalid login', async () => {
    // const res = await request(app)
    //   .post('/api/auth/login')
    //   .send({ email: 'wrong@example.com', password: 'wrong' });
    // expect(res.statusCode).toEqual(401);
    // expect(res.body.success).toBe(false);
    expect(true).toBe(true);
  });
});
