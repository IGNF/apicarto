/*eslint-env node, mocha */

const request = require('supertest');

const server = require('../../../server');

var API_KEY = process.env.GEOPORTAL_API_KEY;

describe('Testing /api/cadastre/parcelle', function() {
    this.timeout(5000);

    describe('With invalid inputs', function() {

        describe('With invalid code_insee', function() {
            it('should reply with 400 for insee=testapi', function(done){
                request(server)
                    .get('/api/cadastre/parcelle?code_insee=testapi&apikey=fake')
                    .expect(400,done);
            });
        });

        describe('With invalid section', function() {
            it('should reply with 400', function(done){
                request(server)
                    .get('/api/cadastre/parcelle?code_insee=94067&section=invalid&apikey=fake')
                    .expect(400,done);
            });
        });

        describe('With invalid code_arr', function() {
            it('should reply with 400', function(done){
                request(server)
                    .get('/api/cadastre/parcelle?code_insee=94067&code_arr=invalid&apikey=fake')
                    .expect(400,done);
            });
        });

        describe('With invalid com_abs', function() {
            it('should reply with 400', function(done){
                request(server)
                    .get('/api/cadastre/parcelle?code_insee=94067&com_abs=invalid&apikey=fake')
                    .expect(400,done);
            });
        });

    });


if ( typeof API_KEY !== 'undefined' ){

    describe('/api/cadastre/parcelle?code_insee=94067&section=0A', function() {
        it('should return a FeatureCollection', function(done){
            request(server)
                .get('/api/cadastre/parcelle?code_insee=94067&section=0A&apikey='+API_KEY)
                .expect(200,done);
        });
    });

    describe('/api/cadastre/parcelle?code_insee=94067&section=0A&com_abs=410&numero=0112', function() {
        it('should work for insee 33290 et section=0A et numero=0112 et com_abs=410', function(done){
            request(server)
                .get('/api/cadastre/parcelle?code_insee=94067&section=0A&numero=0112&com_abs=410&apikey='+API_KEY)
                .expect(200,done);
        });
    });

} // API_KEY is defined

});



