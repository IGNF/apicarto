/*eslint-env node, mocha */
import request from 'supertest';
import expect from 'expect.js';
import { app } from '../../../app.js';

describe('Testing /api/limites-administratives/region', function() {

    describe('With invalid inputs', function() {

        describe('With invalid geom', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/limites-administratives/region?geom=not_valid')
                    .expect(400,done)
                ;
            });
        });

    });

   describe('/api/limites-administratives/region?geom={"type":"Point","coordinates":[4.7962,45.22456]}',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .post('/api/limites-administratives/region')
            .expect(200)
            .send({ 'geom': {"type":"Point","coordinates":[4.7962,45.22456]}})
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties).to.eql({
                        "id": "REGION__0000000000000084",
                        "nom_reg": "Auvergne-Rhône-Alpes",
                        "nom_reg_m": "AUVERGNE-RHONE-ALPES",
                        "insee_reg": "84",
                        "code_siren": "200053767"
                    });
                    expect(feature.bbox).to.eql(
                        [
                            2.06287815,
                            44.11549261,
                            7.1855646,
                            46.80428705
                        ]
                    );
                })
             .end(done);
        });
    });

    describe('/api/limites-administratives/region?lon=4.7962&lat=45.22456',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .get('/api/limites-administratives/region?lon=4.7962&lat=45.22456')
            .expect(200)
            .expect(res => {
                const feature = res.body.features[0];
                expect(feature.geometry.type).to.eql('MultiPolygon');
                expect(feature.properties).to.eql({
                    "id": "REGION__0000000000000084",
                    "nom_reg": "Auvergne-Rhône-Alpes",
                    "nom_reg_m": "AUVERGNE-RHONE-ALPES",
                    "insee_reg": "84",
                    "code_siren": "200053767"
                });
                expect(feature.bbox).to.eql(
                    [
                        2.06287815,
                        44.11549261,
                        7.1855646,
                        46.80428705
                    ]
                );
            })
            .end(done);
        });
    });

    
});
