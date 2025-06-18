/*eslint-env node, mocha */
import request from 'supertest';
import expect from 'expect.js';
import { app } from '../../../app.js';

describe('Testing /api/cadastre/localisant', function() {

    describe('With invalid inputs', function() {

        describe('With invalid code_insee', function() {
            it('should reply with 400 for insee=testapi', function(done){
                request(app)
                    .get('/api/cadastre/localisant?code_insee=testapi')
                    .expect(400,done);
            });
        });

        describe('With invalid section', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/cadastre/localisant?code_insee=94067&section=invalid')
                    .expect(400,done);
            });
        });

        describe('With invalid code_arr', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/cadastre/localisant?code_insee=94067&code_arr=invalid')
                    .expect(400,done);
            });
        });

        describe('With invalid com_abs', function() {
            it('should reply with 400', function(done){
                request(app)
                    .get('/api/cadastre/localisant?code_insee=94067&com_abs=invalid')
                    .expect(400,done);
            });
        });

    });


    it('/api/cadastre/localisant?code_insee=94067', function(done){
        request(app)
            .get('/api/cadastre/localisant?code_insee=94067')
            .expect(200,done);
    });

    it('/api/cadastre/localisant?code_insee=55001&section=ZK&numero=0141', done => {
        request(app)    
            .get('/api/cadastre/localisant?code_insee=55001&section=ZK&numero=0141')
            .expect(res => {
                const feature = res.body.features[0];
                expect(feature.geometry.type).to.eql('MultiPoint');
                expect(feature.properties).to.eql({
                    gid: 14667419,
                    numero: '0141',
                    feuille: 1,
                    section: 'ZK',
                    code_dep: '55',
                    nom_com: 'Abainville',
                    code_com: '001',
                    com_abs: '000',
                    code_arr: '000',
                    idu: "55001000ZK0141",
                    code_insee: '55001'
                });
                expect(feature.bbox).to.eql(
                    [5.50374285,48.52731102,5.50374285,48.52731102]
                )
            })
            .end(done);
    });
});

