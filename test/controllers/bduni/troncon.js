/*eslint-env node, mocha */
import request from 'supertest';
import expect from 'expect.js';
import { app } from '../../../app.js';

describe('Testing /api/bduni/troncon', function() {

    describe('With invalid inputs', function() {

        describe('With invalid geom', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/bduni/troncon?geom=not_valid')
                    .expect(400,done)
                ;
            });
        });

    });

    describe('/api/bduni/troncon?geom={"type":"LineString","coordinates":[[4.681549,47.793784],[4.741974,47.788248]]}',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .get('/api/bduni/troncon?geom={"type":"LineString","coordinates":[[4.681549,47.793784],[4.741974,47.788248]]}')
            .expect(400, done)
        });
    });

    describe('/api/bduni/troncon?geom={"type":"Point","coordinates":[4.829214,45.996981]}',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .get('/api/bduni/troncon?geom={"type":"Point","coordinates":[4.829214,45.996981]}')
            .expect(200)
            .expect(res => {
                const feature = res.body.features[1];
                expect(feature.geometry.type).to.eql('Point');
                expect(feature.properties.numero).to.eql('D904');
            })
            .end(done);
        });
    });

    describe('/api/bduni/troncon?lon=4.82921&lat=45.996981',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .get('/api/bduni/troncon?lon=4.829214&lat=45.996981')
            .expect(200)
            .expect(res => {
                const feature = res.body.features[1];
                expect(feature.geometry.type).to.eql('Point');
                expect(feature.properties.numero).to.eql('D904');
            })
            .end(done);
        });
    });

    describe('/api/bduni/troncon?lon=4.829214&lat=45.996981&distance=100',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .get('/api/bduni/troncon?lon=4.829214&lat=45.996981&distance=100')
            .expect(200)
            .expect(res => {
                const feature = res.body.features[1];
                expect(feature.geometry.type).to.eql('Point');
                expect(feature.properties.numero).to.eql('D904');
            })
            .end(done);
        });
    });

    
});
