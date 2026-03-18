import expect from 'expect.js';
import parseInseeCode from '../../helper/parseInseeCode.js';

describe('#parseCodeInsee()', () => {
    describe('with invalid INSEE codes', () => {
        [
            '5444', // too short
            '544477', // too long
            '2E001',
            '24A01',
            '00000'
        ].forEach(invalidCode => {
            it(`should reject ${invalidCode}`, () => {
                expect(parseInseeCode)
                    .withArgs(invalidCode)
                    .to.throwException('Invalid INSEE code');
            });
        });
    });

    it('should parse basic INSEE code', () => {
        expect(parseInseeCode('25349')).to.eql({
            code_dep: '25',
            code_com: '349'
        });
    });

    it('should parse an INSEE code in 93', () => {
        expect(parseInseeCode('93233')).to.eql({
            code_dep: '93',
            code_com: '233'
        });
    });

    it('should parse DOM/TOM INSEE code', () => {
        expect(parseInseeCode('97209')).to.eql({
            code_dep: '97',
            code_com: '209'
        });
    });

    it('should parse Corse INSEE code', () => {
        expect(parseInseeCode('2A001')).to.eql({
            code_dep: '2A',
            code_com: '001'
        });
    });
});
