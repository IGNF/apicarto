/*eslint-env node, mocha */
import request from 'supertest';
import expect from 'expect.js';
import { app } from '../../../app.js';

const EXPECTED_PROPERTIES = [
    "deleted",
    "name",
    "title",
    "type",
    "zip_codes"
];

describe('Testing /api/er/grid', function() {

    describe('With invalid inputs', function() {

        describe('With invalid geom', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/er/grid?geom=not_valid')
                    .expect(400,done)
                ;
            });
        });

    });

    describe('/api/er/grid?name=01025', function() {
        it('should reply a FeatureCollection containing a valid Feature for name=01025', done => {
            request(app)
                .get('/api/er/grid?name=01025')
                .expect(200)
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    let propertyNames = Object.keys(feature.properties);
                    propertyNames.sort();
                    expect(propertyNames).to.eql(EXPECTED_PROPERTIES);
                    expect(feature.properties.title).to.eql("BAGE-DOMMARTIN");
                })
                .end(done);
        });
    });

    describe('/api/er/grid?title=BEAUPONT', function() {
        it('should reply a FeatureCollection containing a valid Feature for title=BEAUPONT', done => {
            request(app)
                .get('/api/er/grid?title=BEAUPONT')
                .expect(200)
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    let propertyNames = Object.keys(feature.properties);
                    propertyNames.sort();
                    expect(propertyNames).to.eql(EXPECTED_PROPERTIES);

                    expect(feature.properties.name).to.eql('01029');
                    expect(feature.properties.type).to.eql('municipality');
                    expect(feature.properties.zip_codes).to.eql('[\"01270\"]');
                    expect(feature.properties.title).to.eql('BEAUPONT');
                    expect(feature.properties.deleted).to.eql(false);

                    expect(feature.bbox).to.eql(
                        [5.23331158,
                            46.39351348,
                            5.29357027,
                            46.46135244]);
                })
                .end(done);
        });
    });
});