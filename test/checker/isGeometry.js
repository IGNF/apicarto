import expect from 'expect.js';
import isGeometry from '../../checker/isGeometry.js';

describe('Test checker.isGeometry', function() {
    describe('with a string', function() {
        it('should report an error', function() {
            expect(isGeometry).withArgs('test string').to.throwError();
        });
    });

    describe('with a non geometry object', function() {
        it('should report an error', function() {
            expect(isGeometry).withArgs({username: 'toto'}).to.throwError();
        });
    });

    describe('with an invalid Point', function() {
        it('should not report an error', function() {
            expect(isGeometry).withArgs({type: 'Point',coordinates:[3.0]}).to.throwError();
        });
    });
    
    describe('with a valid Point', function() {
        it('should not report an error', function() {
            expect(isGeometry).withArgs({type: 'Point',coordinates:[3.0,5.0]}).to.not.throwError();
        });
    });

    describe('with a valid Point but too many decimals', function() {
        it('should not report an error', function() {
            expect(isGeometry).withArgs({type: 'Point',coordinates:[3.123456789,5.123456789]}).to.not.throwError();
        });
    });

    describe('with a polygon with a bad orientation', function(){
        it('should not report an error', function(){
            expect(isGeometry).withArgs(
                {type:'MultiPolygon',coordinates:[[[[-1.6993786,48.1113366],[-1.6994647,48.1113416],[-1.6994613,48.1113573],[-1.6993639,48.111803],[-1.6992707,48.112222],[-1.6990176,48.1120599],[-1.6989945,48.1120573],[-1.6991084,48.111617],[-1.6991262,48.1115482],[-1.6993407,48.1115608],[-1.6993494,48.1115158],[-1.699361,48.111431],[-1.6993786,48.1113366]]]]}
            ).to.not.throwError();
        });
    });

});
