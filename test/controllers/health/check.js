/* eslint-env node, mocha */
import request from 'supertest';
import { app } from '../../../app.js';

describe('/health', function() {
    describe('/check', function() {
        describe('health check', function() {
            it('should reply with 200', function(done) {
                request(app)
                    .get('/api/health/check')
                    .expect(200, done);
            });
        });
    });
});
