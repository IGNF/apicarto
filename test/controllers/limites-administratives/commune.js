/*eslint-env node, mocha */
import request from 'supertest';
import expect from 'expect.js';
import { app } from '../../../app.js';

describe('Testing /api/limites-administratives/commune', function() {

    describe('With invalid inputs', function() {

        describe('With invalid geom', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/limites-administratives/commune?geom=not_valid')
                    .expect(400,done)
                ;
            });
        });

    });

    describe('/api/limites-administratives/commune?geom={"type":"Point","coordinates":[4.7962,45.22456]}',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .post('/api/limites-administratives/commune')
            .expect(200)
            .send({ 'geom': {"type":"Point","coordinates":[4.7962,45.22456]}})
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties).to.eql({
                        "id": "COMMUNE_0000000009754224",
                        "nom_com": "Andance",
                        "nom_com_m": "ANDANCE",
                        "insee_com": "07009",
                        "statut": "Commune simple",
                        "population": "1197",
                        "insee_arr": "3",
                        "insee_dep": "07",
                        "insee_reg": "84",
                        "code_epci": "200040491",
                        "nom_dep": "Ardèche",
                        "nom_reg": "Auvergne-Rhône-Alpes"
                    });
                    expect(feature.bbox).to.eql(
                        [
                            4.78195762,
                            45.20311472,
                            4.81250422,
                            45.26006374
                        ]
                    );
                })
             .end(done);
        });
    });

    describe('/api/limites-administratives/commune?lon=4.7962&lat=45.22456',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .get('/api/limites-administratives/commune?lon=4.7962&lat=45.22456')
            .expect(200)
            .expect(res => {
                const feature = res.body.features[0];
                expect(feature.geometry.type).to.eql('MultiPolygon');
                expect(feature.properties).to.eql({
                    "id": "COMMUNE_0000000009754224",
                    "nom_com": "Andance",
                    "nom_com_m": "ANDANCE",
                    "insee_com": "07009",
                    "statut": "Commune simple",
                    "population": "1197",
                    "insee_arr": "3",
                    "insee_dep": "07",
                    "insee_reg": "84",
                    "code_epci": "200040491",
                    "nom_dep": "Ardèche",
                    "nom_reg": "Auvergne-Rhône-Alpes"
                });
                expect(feature.bbox).to.eql(
                    [
                        4.78195762,
                        45.20311472,
                        4.81250422,
                        45.26006374
                    ]
                );
            })
            .end(done);
        });
    });

    
});
