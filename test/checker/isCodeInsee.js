import expect from 'expect.js';
import isCodeInsee from '../../checker/isCodeInsee.js';

const invalidInseeCodes = ['invalid', '25','2A', '99999'];
const validInseeCodes = ['25349', '97501','2A004', '2B033'];

describe('Test checker.isCodeInsee', function() {

    describe('Test invalid codes', function() {
        invalidInseeCodes.forEach(function(code){
            it('should report an error for "'+code+'"', function() {
                expect(isCodeInsee).withArgs(code).to.throwError();
            });
        });
    });

    describe('Test valid codes', function() {
        validInseeCodes.forEach(function(code){
            it('should not report an error for "'+code+'", should return true', function() {
                expect(isCodeInsee).withArgs(code).to.not.throwError();
                expect(isCodeInsee(code)).to.be.eql(true);
            });
        });
    });

});
