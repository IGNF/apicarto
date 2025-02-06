/*eslint-env node, mocha */
import request from 'supertest';
import expect from 'expect.js';
import { app } from '../../../app.js';

describe('Testing /api/cadastre/commune', function() {

    describe('With invalid inputs', function() {

        describe('With invalid code_insee', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/cadastre/commune?code_insee=not_valid')
                    .expect(400,done)
                ;
            });
        });

    });

    /* filtrage par code insee */
    describe('/api/cadastre/commune?code_insee=55001',function(){
        it('should reply with 200', done => {
            request(app)    
                .get('/api/cadastre/commune?code_insee=55001')
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql("MultiPolygon");
                    /*expect(feature.properties).to.eql({
                        nom_com: 'Abainville',
                        code_dep: '55',
                        code_insee: '55001'
                    });*/
                })
                .end(done);
        });
    });

    /* filtrage par code_dep */
    describe('/api/cadastre/commune?code_dep=94',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)    
                .get('/api/cadastre/commune?code_dep=94')
                .expect(200)
                .expect(res => {
                    const features = res.body.features;
                    expect(features.length).to.be.greaterThan(5);
                })
                .end(done)
            ;
        });
    });

   describe('/api/cadastre/commune?geom={"type":"Point","coordinates":[4.7962,45.22456]}',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .post('/api/cadastre/commune')
            .expect(200)
            .send({ 'geom': {"type":"Point","coordinates":[4.7962,45.22456]}})
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties).to.eql({
                        "gid": 28992,
                        "nom_com": "Andance",
                        "code_dep": "07",
                        "code_insee": "07009",
                    });
                    expect(feature.bbox).to.eql(
                        [
                            4.78197598,
                            45.20282918,
                            4.81150389,
                            45.26006379
                        ]
                    );
                })
             .end(done);
        });
    });

    
});
