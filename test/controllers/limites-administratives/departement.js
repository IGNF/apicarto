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

   describe('/api/limites-administratives/departement?geom={"type":"Point","coordinates":[5.0477,44.0547]}',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .post('/api/limites-administratives/departement')
            .expect(200)
            .send({ 'geom': {"type":"Point","coordinates":[5.0477,44.0547]}})
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    expect(feature.properties.nom_dep).to.eql('Vaucluse');
                    expect(feature.properties.nom_dep_m).to.eql('VAUCLUSE');
                    expect(feature.properties.insee_dep).to.eql('84');
                    expect(feature.properties.insee_reg).to.eql('93');
                })
             .end(done);
        });
    });

    describe('/api/limites-administratives/departement?lon=5.0477&lat=44.0547',function(){
        it('should reply a FeatureCollection with valid features', done => {
            request(app)
            .get('/api/limites-administratives/departement?lon=5.0477&lat=44.0547')
            .expect(200)
            .expect(res => {
                const feature = res.body.features[0];
                expect(feature.geometry.type).to.eql('MultiPolygon');
                expect(feature.properties.nom_dep).to.eql('Vaucluse');
                expect(feature.properties.nom_dep_m).to.eql('VAUCLUSE');
                expect(feature.properties.insee_dep).to.eql('84');
                expect(feature.properties.insee_reg).to.eql('93');
            })
            .end(done);
        });
    });

    
});
