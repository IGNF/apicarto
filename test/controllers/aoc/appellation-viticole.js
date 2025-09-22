/* eslint-env node, mocha */
import request from 'supertest';
import { app } from '../../../app.js';
import expect from 'expect.js';

describe('/api/aoc/appellation-viticole', function() {
    describe('without filtering parameter', function() {
        it('should reply with 400', function(done) {
            request(app)
                .post('/api/aoc/appellation-viticole')
                .expect(400, done);
        });
    });

    /*
    Tests qui marchent en local mais pas dans github car il ne connait pas la variable APIKEY
    TODO : Gérer l'apikey via les secrets de github ?*/

    // describe('with invalid geom', function() {
    //     it('should reply an error', function(done) {
    //         request(app)
    //             .post('/api/aoc/appellation-viticole?apikey=' + process.env.APIKEY + '&source=prd&geom={"type":"Point","coordinates":[1.654399]}')
    //             .expect(400)
    //             .end(done);
    //         ;
    //     });
    // });
    // describe('with point at [1.654399,48.112235]', function() {
    //     it('should reply a list of FeatureCollection', function(done) {
    //         request(app)
    //             .post('/api/aoc/appellation-viticole?apikey=' + process.env.APIKEY +'&source=prd&geom={"type":"Point","coordinates":[-1.691634,48.104237]}')
    //             .expect(200)
    //             .expect(res => {
    //                 expect(res.body).to.be.an('object');
    //                 expect(res.body.features).to.be.an('array');
    //                 expect(res.body.features).to.not.empty();
    //             })
    //             .end(done);
    //         ;
    //     });
    // });
});
