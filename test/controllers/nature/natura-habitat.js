/* eslint-env node, mocha */
import request from 'supertest';
import { app } from '../../../app.js';
import expect from 'expect.js';

describe('/api/nature/natura-habitat', function() {

    describe('with invalid geom', function() {
        it('should reply an error', function(done) {
            request(app)
                .get('/api/nature/natura-habitat?geom={"type": "Point","coordinates":[4.80641007]}')
                .expect(400)
                .end(done);
            ;
        });
    });


    describe('with point at [1.654399,48.112235]', function() {
        it('should reply a list of FeatureCollection', function(done) {
            request(app)
                .get('/api/nature/natura-habitat?geom={"type": "Point","coordinates":[4.701549,47.790784]}')
                .expect(200)
                .expect(res => {
                    expect(res.body).to.be.an('object');
                    expect(res.body.features).to.be.an('array');
                    expect(res.body.features).to.not.empty();
                })
                .end(done);
            ;
        });
    });
});
