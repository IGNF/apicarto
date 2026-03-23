/*eslint-env node, mocha */
import request from 'supertest';
import expect from 'expect.js';
import { app } from '../../../app.js';

const EXPECTED_PROPERTIES = [
    "back_image",
    "background_color",
    "border_color",
    "category_id",
    "code_article",
    "code_ean",
    "collection_slug",
    "collection_title",
    "complement",
    "continent",
    "deleted_at",
    "departement",
    "dimension",
    "ean_symb",
    "edition_number",
    "editorial",
    "er_visible_from",
    "er_visible_to",
    "front_image",
    "full_description",
    "has_geometry",
    "is_manufactured",
    "keywords",
    "name",
    "name_complement",
    "pays",
    "previous_publication_date",
    "price",
    "price_excluding_vat",
    "pricecode",
    "print_medium",
    "producer",
    "publication_date",
    "region",
    "replacement",
    "sale",
    "scale",
    "segment_slug",
    "segment_title",
    "theme_slug",
    "theme_title",
    "tva_type",
    "updated_at",
    "vat"
];

describe('Testing /api/er/category', function() {

    describe('With invalid inputs', function() {

        describe('With invalid type', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/er/category?type=not_valid')
                    .expect(400,done)
                ;
            });
        });
        
        describe('With missing type argument', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/er/category?name=CARTES DE RANDONNÉE')
                    .expect(400,done)
                ;
            });
        });
    });

    describe('/api/er/category?name=CARTES DE RANDONNÉE&type=s', function() {
        it('should reply a FeatureCollection containing a valid Feature for name=CARTES DE RANDONNÉE & type=s', done => {
            request(app)
                .get('/api/er/category?name=CARTES DE RANDONNÉE&type=s')
                .expect(200)
                .expect(res => {
                    const feature = res.body.features[0];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    let propertyNames = Object.keys(feature.properties);
                    propertyNames.sort();
                    expect(propertyNames).to.eql(EXPECTED_PROPERTIES);
                    expect(feature.properties.segment_title).to.eql('CARTES DE RANDONNÉE');
                })
                .end(done);
        });
    });

    describe('/api/er/category?category_id=13', function() {
        it('should reply a FeatureCollection containing a valid Feature for category_id=13', done => {
            request(app)
                .get('/api/er/category?category_id=13')
                .expect(200)
                .expect(res => {
                    const feature = res.body.features[1];
                    expect(feature.geometry.type).to.eql('MultiPolygon');
                    let propertyNames = Object.keys(feature.properties);
                    propertyNames.sort();
                    expect(propertyNames).to.eql(EXPECTED_PROPERTIES);
                    expect(feature.properties.category_id).to.eql(13);
                })
                .end(done);
        });
    });
});