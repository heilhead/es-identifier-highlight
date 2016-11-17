'use babel';

import utils from './utils/samples';
import Inspector from '../lib/inspector/inspector.js';

describe('Inspector checks', () => {
    describe('globals', () => {
        let src = utils.getSource('./samples/globals.js');
        let markers = utils.getMarkers(src);

        let ins = new Inspector();

        it('finds all usages of global vars', () => {
            expect(ins.parse(src)).toBe(true);

            let occ = ins.findOccurrences(markers[1]);

            expect(occ.isGlobal).toBe(true);
            expect(occ.usages.length).toBe(2);
            expect(occ.usages[0].start).toBe(markers[1]);
            expect(occ.usages[1].start).toBe(markers[2]);
        });
    });

    describe('es6 features', () => {
        let src = utils.getSource('./samples/es6-features.js');
        let markers = utils.getMarkers(src);

        let ins = new Inspector();

        it('parses sample code', () => {
            expect(ins.parse(src)).toBe(true);
        });

        it('supports import statements', () => {
            // test1
            let occ = ins.findOccurrences(markers[1]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[1]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[5]);

            // test2
            occ = ins.findOccurrences(markers[6]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[2]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[6]);

            // test3
            occ = ins.findOccurrences(markers[3]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[3]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[7]);

            // test4
            occ = ins.findOccurrences(markers[8]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[4]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[8]);
        });

        it('supports array destructuring', () => {
            // test1
            let occ = ins.findOccurrences(markers[9]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[9]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[11]);

            // test2
            occ = ins.findOccurrences(markers[10]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[10]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[12]);

            // test3
            occ = ins.findOccurrences(markers[13]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[13]);
            expect(occ.usages.length).toBe(2);
            expect(occ.usages[0].start).toBe(markers[15]);
            expect(occ.usages[1].start).toBe(markers[18]);

            // test4
            occ = ins.findOccurrences(markers[14]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[14]);
            expect(occ.usages.length).toBe(2);
            expect(occ.usages[0].start).toBe(markers[16]);
            expect(occ.usages[1].start).toBe(markers[17]);
        });

        it('supports object destructuring', () => {
            // test1
            let occ = ins.findOccurrences(markers[19]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[19]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[21]);

            // test2
            occ = ins.findOccurrences(markers[20]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[20]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[22]);

            // test3
            occ = ins.findOccurrences(markers[23]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[23]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[25]);

            // test4
            occ = ins.findOccurrences(markers[24]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[24]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[26]);

            // test5
            occ = ins.findOccurrences(markers[27]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[27]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[29]);

            // test6
            occ = ins.findOccurrences(markers[28]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[28]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[30]);
        });

        it('supports destructuring in function params', () => {
            // test1
            let occ = ins.findOccurrences(markers[31]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[31]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[33]);

            // test2
            occ = ins.findOccurrences(markers[32]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[32]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[34]);
        });

        it('supports destructuring with renaming', () => {
            // test1
            let occ = ins.findOccurrences(markers[35]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[35]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[37]);

            // test2
            occ = ins.findOccurrences(markers[36]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[36]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[38]);
        });

        it('supports destructuring with renaming in function params', () => {
            // test1
            let occ = ins.findOccurrences(markers[39]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[39]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[41]);

            // test2
            occ = ins.findOccurrences(markers[40]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[40]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[42]);
        });
    });

    describe('jsx', () => {
        let src = utils.getSource('./samples/jsx.js');

        // @todo jsx tests!
        it('needs more jsx tests!', () => {
            expect(true).toBe(true);
        });
    });

    describe('literals, properties and class methods', () => {
        let src = utils.getSource('./samples/literals.js');
        let markers = utils.getMarkers(src);

        let ins = new Inspector();

        it('parses sample code', () => {
            expect(ins.parse(src)).toBe(true);
        });

        it('finds properties and literals globally', () => {
            // test1
            let occ = ins.findOccurrences(markers[1]);

            expect(occ.isLiteral).toBe(true);
            expect(occ.usages.length).toBe(4);
            expect(occ.usages[0].start).toBe(markers[1]);
            expect(occ.usages[1].start).toBe(markers[4]);
            expect(occ.usages[2].start).toBe(markers[17]);
            expect(occ.usages[3].start).toBe(markers[19]);

            // test2
            occ = ins.findOccurrences(markers[2]);

            expect(occ.isLiteral).toBe(true);
            expect(occ.usages.length).toBe(3);
            expect(occ.usages[0].start).toBe(markers[2]);
            expect(occ.usages[1].start).toBe(markers[3]);
            expect(occ.usages[2].start).toBe(markers[20]);
        });

        it('inspects nested objects', () => {
            // test1
            let occ = ins.findOccurrences(markers[6]);

            expect(occ.isLiteral).toBe(true);
            expect(occ.usages.length).toBe(2);
            expect(occ.usages[0].start).toBe(markers[6]);
            expect(occ.usages[1].start).toBe(markers[26]);

            // test2
            occ = ins.findOccurrences(markers[9]);

            expect(occ.isLiteral).toBe(true);
            expect(occ.usages.length).toBe(3);
            expect(occ.usages[0].start).toBe(markers[9]);
            expect(occ.usages[1].start).toBe(markers[21]);
            expect(occ.usages[2].start).toBe(markers[23]);
        });

        it('inspects function properties', () => {
            // test1
            let occ = ins.findOccurrences(markers[7]);

            expect(occ.isLiteral).toBe(true);
            expect(occ.usages.length).toBe(2);
            expect(occ.usages[0].start).toBe(markers[7]);
            expect(occ.usages[1].start).toBe(markers[14]);
        });

        it('inspects class methods', () => {
            // test1
            let occ = ins.findOccurrences(markers[8]);

            expect(occ.isLiteral).toBe(true);
            expect(occ.usages.length).toBe(3);
            expect(occ.usages[0].start).toBe(markers[8]);
            expect(occ.usages[1].start).toBe(markers[15]);
            expect(occ.usages[2].start).toBe(markers[18]);
        });
    });

    describe('es-next features support', () => {
        let src = utils.getSource('./samples/es-next-features.js');
        let markers = utils.getMarkers(src);

        let ins = new Inspector();

        it('parses code', () => {
            expect(ins.parse(src)).toBe(true);
        });

        it('supports class properties', () => {
            let occ = ins.findOccurrences(markers[4]);

            expect(occ.isLiteral).toBe(true);
            expect(occ.usages.length).toBe(3);
            expect(occ.usages[0].start).toBe(markers[5]);
            expect(occ.usages[1].start).toBe(markers[4]);
            expect(occ.usages[2].start).toBe(markers[7]);
        });

        it('supports spread properties', () => {
            let occ = ins.findOccurrences(markers[9]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[12]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[9]);
        });

        it('supports advanced spread syntax', () => {
            let occ = ins.findOccurrences(markers[14]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[13]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[14]);
        });
    });

    describe('shell script support', () => {
        let src = utils.getSource('./samples/shellscript.js');
        let markers = utils.getMarkers(src);

        let ins = new Inspector();

        it('supports hashbang', () => {
            expect(ins.parse(src)).toBe(true);

            let occ = ins.findOccurrences(markers[1]);

            expect(occ.isGlobal).toBe(false);
            expect(occ.definition.start).toBe(markers[1]);
            expect(occ.usages.length).toBe(1);
            expect(occ.usages[0].start).toBe(markers[2]);
        });
    });
});
