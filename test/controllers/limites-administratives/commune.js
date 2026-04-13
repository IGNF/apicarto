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
                    expect(feature.properties.nom_com).to.eql('Andance');
                    expect(feature.properties.nom_com_m).to.eql('ANDANCE');
                    expect(feature.properties.insee_com).to.eql('07009');
                    expect(feature.properties.insee_dep).to.eql('07');
                    expect(feature.properties.insee_reg).to.eql('84');
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
                expect(feature.properties.nom_com).to.eql('Andance');
                expect(feature.properties.nom_com_m).to.eql('ANDANCE');
                expect(feature.properties.insee_com).to.eql('07009');
                expect(feature.properties.insee_dep).to.eql('07');
                expect(feature.properties.insee_reg).to.eql('84');
            })
            .end(done);
        });
    });

    
});
