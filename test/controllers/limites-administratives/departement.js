/*eslint-env node, mocha */
import request from 'supertest';
import expect from 'expect.js';
import { app } from '../../../app.js';

describe('Testing /api/limites-administratives/departement', function() {

    describe('With invalid inputs', function() {

        describe('With invalid geom', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/limites-administratives/departement?geom=not_valid')
                    .expect(400,done)
                ;
            });
        });

    });

   describe('/api/limites-administratives/departement?geom={"type":"Point","coordinates":[4.7962,45.22456]}',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .post('/api/limites-administratives/departement')
            .expect(200)
            .send({ 'geom': {"type":"Point","coordinates":[4.7962,45.22456]}})
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties).to.eql({
                        "id": "DEPARTEM_FXX_00000000009",
                        "nom_dep": "Ardèche",
                        "insee_dep": "07",
                        "insee_reg": "84"
                    });
                    expect(feature.bbox).to.eql(
                        [
                            3.86109916,
                            44.2643371,
                            4.88647239,
                            45.36619392
                        ]
                    );
                })
             .end(done);
        });
    });

    describe('/api/limites-administratives/departement?lon=4.7962&lat=45.22456',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .get('/api/limites-administratives/departement?lon=4.7962&lat=45.22456')
            .expect(200)
            .expect(res => {
                const feature = res.body.features[0];
                expect(feature.geometry.type).to.eql('MultiPolygon');
                expect(feature.properties).to.eql({
                    "id": "DEPARTEM_FXX_00000000009",
                    "nom_dep": "Ardèche",
                    "insee_dep": "07",
                    "insee_reg": "84"
                });
                expect(feature.bbox).to.eql(
                    [
                        3.86109916,
                        44.2643371,
                        4.88647239,
                        45.36619392
                    ]
                );
            })
            .end(done);
        });
    });

    
});
