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

   describe('/api/limites-administratives/region?geom={"type":"Point","coordinates":[2.3515,48.8564]}',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .post('/api/limites-administratives/region')
            .expect(200)
            .send({ 'geom': {"type":"Point","coordinates":[2.3515,48.8564]}})
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties.nom_reg).to.eql('Île-de-France');
                    expect(feature.properties.nom_reg_m).to.eql('ILE-DE-FRANCE');
                    expect(feature.properties.insee_reg).to.eql('11');
                })
             .end(done);
        });
    });

    describe('/api/limites-administratives/region?lon=2.3515&lat=48.8564',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .get('/api/limites-administratives/region?lon=2.3515&lat=48.8564')
            .expect(200)
            .expect(res => {
                const feature = res.body.features[0];
                expect(feature.geometry.type).to.eql('MultiPolygon');
                expect(feature.properties.nom_reg).to.eql('Île-de-France');
                expect(feature.properties.nom_reg_m).to.eql('ILE-DE-FRANCE');
                expect(feature.properties.insee_reg).to.eql('11');
            })
            .end(done);
        });
    });

    
});
