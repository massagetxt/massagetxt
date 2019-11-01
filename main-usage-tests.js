import { throws, deepEqual } from 'assert';

import { MSTMassage } from './main.js';

describe('MSTMassage_Usage', function testMSTMassage_Usage() {

	it('param1 empty', function () {
		deepEqual(MSTMassage('', '$input'), '');
	});

	it('param2 empty', function () {
		deepEqual(MSTMassage('alfa', ''), 'alfa');
	});

	it('$input', function () {
		deepEqual(MSTMassage('alfa', '$input'), 'alfa');
	});

	context('string', function () {

		it('match bool false', function () {
			deepEqual(MSTMassage('alfa', '$input.isMatch(/bravo/)'), 'false');
		});

		it('match bool true', function () {
			deepEqual(MSTMassage('alfa', '$input.isMatch(/alfa/)'), 'true');
		});

		it('match array with no capture', function () {
			deepEqual(MSTMassage('- alfa\n- bravo\n', '$input.matchArray(/- .*\n/)'), '[]');
		});

		it('match array with capture with no global', function () {
			deepEqual(MSTMassage('- alfa\n- bravo\n', '$input.matchArray(/- (.*)\n/)'), JSON.stringify([{ 1: 'alfa' }]));
		});

		it('match array with capture with global', function () {
			deepEqual(MSTMassage('- alfa\n- bravo\n', '$input.matchArray(/- (.*)\n/g)'), JSON.stringify([{ 1: 'alfa' }, { 1: 'bravo' }]));
		});

		it('lines', function () {
			deepEqual(MSTMassage('alfa\nbravo\n', '$input.lines'), JSON.stringify(['alfa', 'bravo']));
		});
	
	});

	context('array', function () {

		it('first', function () {
			deepEqual(MSTMassage('alfa\nbravo\n', '$input.lines.first'), 'alfa');
		});

		it('last', function () {
			deepEqual(MSTMassage('alfa\nbravo\n', '$input.lines.last'), 'bravo');
		});

		it('index', function () {
			deepEqual(MSTMassage('alfa\nbravo\n', '$input.lines[1]'), 'bravo');
		});
	
	});

});
