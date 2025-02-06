/*eslint-env node, mocha */
import request from 'supertest';
import expect from 'expect.js';
import { app } from '../../../app.js';

describe('Testing /api/admin-express/commune', function() {

    describe('With invalid inputs', function() {

        describe('With invalid geom', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/admin-express/commune?geom=not_valid')
                    .expect(400,done)
                ;
            });
        });

    });

    describe('/api/admin-express/commune?geom={"type":"Point","coordinates":[4.7962,45.22456]}',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .post('/api/admin-express/commune')
            .expect(200)
            .send({ 'geom': {"type":"Point","coordinates":[4.7962,45.22456]}})
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties).to.eql({
                        "id": "COMMUNE_0000000009754224",
                        "nom": "Andance",
                        "nom_m": "ANDANCE",
                        "insee_com": "07009",
                        "statut": "Commune simple",
                        "population": "1197",
                        "insee_can": "11",
                        "insee_arr": "3",
                        "insee_dep": "07",
                        "insee_reg": "84",
                        "siren_epci": "200040491",
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

    describe('/api/admin-express/commune?lon=4.7962&lat=45.22456',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .get('/api/admin-express/commune?lon=4.7962&lat=45.22456')
            .expect(200)
            .expect(res => {
                const feature = res.body.features[0];
                expect(feature.geometry.type).to.eql('MultiPolygon');
                expect(feature.properties).to.eql({
                    "id": "COMMUNE_0000000009754224",
                    "nom": "Andance",
                    "nom_m": "ANDANCE",
                    "insee_com": "07009",
                    "statut": "Commune simple",
                    "population": "1197",
                    "insee_can": "11",
                    "insee_arr": "3",
                    "insee_dep": "07",
                    "insee_reg": "84",
                    "siren_epci": "200040491",
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
