/*eslint-env node, mocha */
import request from 'supertest';
import expect from 'expect.js';
import { app } from '../../../app.js';

const EXPECTED_PROPERTIES = [
    "code_arr",
    "code_com",
    "code_dep",
    "code_insee",
    "com_abs",
    "echelle",
    "edition",
    "feuille",
    "nom_com",
	"section"
];


describe('Testing /api/cadastre/division', function() {

    describe('With invalid inputs', function() {

        describe('With invalid code_insee', function() {
            it('should reply with 400 for insee=testapi', function(done){
                request(app)
                    .get('/api/cadastre/division?code_insee=testapi')
                    .expect(400,done);
            });
        });

        describe('With invalid section', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/cadastre/division?code_insee=94067&section=invalid')
                    .expect(400,done);
            });
        });

    });

    describe('/api/cadastre/division?code_insee=94067&section=0A', function() {
        it('should reply a FeatureCollection containing a valid Feature for insee=94067 and section=0A', done => {
            request(app)
                .get('/api/cadastre/division?code_insee=94067&section=0A')
                .expect(200)
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    let propertyNames = Object.keys(feature.properties);
                    propertyNames.sort();
                    expect(propertyNames).to.eql(EXPECTED_PROPERTIES);
                    expect(feature.properties.nom_com).to.eql('Saint-Mandé');
                })
                .end(done);
        });
    });

    describe('/api/cadastre/division?code_insee=75056&code_arr=112&section=AA', function() {
        it('should reply a FeatureCollection containing a valid Feature for case Paris 12e', done => {
            request(app)
                .get('/api/cadastre/division?code_insee=75056&code_arr=112&section=AA')
                .expect(200)
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    let propertyNames = Object.keys(feature.properties);
                    propertyNames.sort();
                    expect(propertyNames).to.eql(EXPECTED_PROPERTIES);

                    expect(feature.properties.section).to.eql('AA');
                    expect(feature.properties.code_dep).to.eql('75');
                    expect(feature.properties.nom_com).to.eql('Paris');
                    expect(feature.properties.code_arr).to.eql('112');
                    expect(feature.properties.code_insee).to.eql('75056');
                })
                .end(done);
        });
    });

});
