import { throws, deepEqual } from 'assert';

import * as mainModule from './main.js';

describe('MSTMassage', function testMSTMassage() {

	it('throws if param1 not string', function() {
		throws(function() {
			mainModule.MSTMassage(null, '');
		}, /MSTErrorInputNotValid/);
	});

	it('throws if param2 not string', function() {
		throws(function() {
			mainModule.MSTMassage('', null);
		}, /MSTErrorInputNotValid/);
	});

	it('returns input', function () {
		deepEqual(mainModule.MSTMassage('alfa', ''), 'alfa');
	});

	it('parses expression', function () {
		deepEqual(mainModule.MSTMassage('alfa\nbravo', '$input.lines.last'), 'bravo');
	});

	it('throws if identifier not valid', function() {
		throws(function() {
			mainModule.MSTMassage('alfa\nbravo', '$input.alfa')
		}, /MSTErrorIdentifierNotValid/);
	});

	it('throws if identifier not valid based on input', function() {
		throws(function() {
			mainModule.MSTMassage('alfa\nbravo', '$input.last')
		}, /MSTErrorIdentifierNotValid/);
	});

});

describe('_MSTMassageInputTypes', function test_MSTMassageInputTypes() {

	it('throws if not string', function() {
		throws(function() {
			mainModule._MSTMassageInputTypes(null);
		}, /MSTErrorInputNotValid/);
	});

	it('returns array', function() {
		deepEqual(mainModule._MSTMassageInputTypes(''), []);
	});

	it('excludes if blank', function() {
		deepEqual(mainModule._MSTMassageInputTypes(','), []);
	});

	it('includes if single', function() {
		deepEqual(mainModule._MSTMassageInputTypes('alfa'), ['alfa']);
	});

	it('includes if multiple', function() {
		deepEqual(mainModule._MSTMassageInputTypes('alfa,bravo'), ['alfa', 'bravo']);
	});

	it('trims whitespace', function() {
		deepEqual(mainModule._MSTMassageInputTypes('alfa , bravo'), ['alfa', 'bravo']);
	});

});

describe('_MSTMassageTypeForInput', function test_MSTMassageTypeForInput() {

	it('returns String if string', function() {
		deepEqual(mainModule._MSTMassageTypeForInput(''), 'String');
	});

	it('returns Array if array', function() {
		deepEqual(mainModule._MSTMassageTypeForInput([]), 'Array');
	});

	it('returns Object if object', function() {
		deepEqual(mainModule._MSTMassageTypeForInput({}), 'Object');
	});

	it('throws', function() {
		throws(function() {
			mainModule._MSTMassageTypeForInput(null);
		}, /MSTErrorInputNotValid/);
	});

});

describe('_MSTIsGroup', function test_MSTIsGroup () {

	it('throws if param1 not object', function() {
		throws(function() {
			mainModule._MSTIsGroup(null, '');
		}, /MSTErrorInputNotValid/);
	});

	it('returns false if MSTGroupValue not object', function () {
		deepEqual(mainModule._MSTIsGroup({
			MSTGroupValue: null,
		}), false);
	});
	
	it('returns true', function () {
		deepEqual(mainModule._MSTIsGroup({ MSTGroupValue: {} }), true);
	});

});

describe('__MSTMassageOperations', function test__MSTMassageOperations() {

	it('returns array', function () {
		deepEqual(mainModule.__MSTMassageOperations(), [{
			MSTOperationPattern: /^\$?input$/,
			MSTOperationCallback: mainModule._MSTOperations._MSTBypass
		}, {
			MSTOperationPattern: /^lines$/,
			MSTOperationInputTypes: 'String',
			MSTOperationCallback: mainModule._MSTOperations.MSTStringLines
		}, {
			MSTOperationPattern: /^isMatch\(\/([^]+)\/(\w)?\)$/,
			MSTOperationInputTypes: 'String,Regex',
			MSTOperationCallback: mainModule._MSTOperations.MSTStringIsMatch,
		}, {
			MSTOperationPattern: /^match\(\/([^]+)\/(\w)?\)$/,
			MSTOperationInputTypes: 'String,Regex',
			MSTOperationCallback: mainModule._MSTOperations.MSTStringMatch,
		}, {
			MSTOperationPattern: /^first$/,
			MSTOperationInputTypes: 'Array',
			MSTOperationCallback: mainModule._MSTOperations.MSTArrayFirst,
		}, {
			MSTOperationPattern: /^last$/,
			MSTOperationInputTypes: 'Array',
			MSTOperationCallback: mainModule._MSTOperations.MSTArrayLast,
		}, {
			MSTOperationPattern: /^\[([^]+)\]$/,
			MSTOperationInputTypes: 'Array',
			MSTOperationCallback: mainModule._MSTOperations.MSTArrayAccess,
		}, {
			MSTOperationPattern: /^reverse$/,
			MSTOperationInputTypes: 'Array',
			MSTOperationCallback: mainModule._MSTOperations.MSTArrayReverse,
		}, {
			MSTOperationPattern: /^unique$/,
			MSTOperationInputTypes: 'Array',
			MSTOperationCallback: mainModule._MSTOperations.MSTArrayUnique,
		}, {
			MSTOperationPattern: /^group\((\w+)\)$/,
			MSTOperationInputTypes: 'Array,String',
			MSTOperationCallback: mainModule._MSTOperations.MSTArrayGroup,
		}, {
			MSTOperationPattern: /^isMatch\(\/([^]+)\/(\w)?\)$/,
			MSTOperationInputTypes: 'Array,Regex',
			MSTOperationCallback: mainModule._MSTOperations.MSTArrayIsMatch,
		}, {
			MSTOperationPattern: /^match\(\/([^]+)\/(\w)?\)$/,
			MSTOperationInputTypes: 'Array,Regex',
			MSTOperationCallback: mainModule._MSTOperations.MSTArrayMatch,
		}, {
			MSTOperationPattern: /^remap\(([^]+)\)$/,
			MSTOperationInputTypes: 'Array,String',
			MSTOperationCallback: mainModule._MSTOperations.MSTArrayRemap,
		}, {
			MSTOperationPattern: /^print\(([^]+)\)$/,
			MSTOperationInputTypes: 'Array,String',
			MSTOperationCallback: mainModule._MSTOperations.MSTArrayPrint,
		}, {
			MSTOperationPattern: /^remap\(([^]+)\)$/,
			MSTOperationInputTypes: 'Object,String',
			MSTOperationCallback: mainModule._MSTOperations.MSTObjectRemap,
		}, {
			MSTOperationPattern: /^print\(([^]+)\)$/,
			MSTOperationInputTypes: 'Object,String',
			MSTOperationCallback: mainModule._MSTOperations.MSTObjectPrint,
		}]);
	});

});

describe('_MSTMassageTerminate', function test_MSTMassageTerminate() {

	it('returns string if not string', function () {
		deepEqual(mainModule._MSTMassageTerminate(null), 'null');
	});

	it('returns input', function () {
		deepEqual(mainModule._MSTMassageTerminate('alfa'), 'alfa');
	});

});

describe('__MSTMassageTerminateFunction', function test__MSTMassageTerminateFunction() {

	it('returns JSON.stringify if not string', function () {
		deepEqual(mainModule.__MSTMassageTerminateFunction(null), JSON.stringify);
	});

	it('returns _MSTBypass', function () {
		deepEqual(mainModule.__MSTMassageTerminateFunction(''), mainModule._MSTOperations._MSTBypass);
	});

});

describe('_MSTBypass', function test_MSTBypass () {

	it('returns input', function () {
		let item = function () {};
		deepEqual(mainModule._MSTOperations._MSTBypass(item), item);
	});

});

describe('MSTStringLines', function testMSTStringLines () {
	
	it('returns array', function () {
		deepEqual(mainModule._MSTOperations.MSTStringLines(''), []);
	});

	it('excludes if not filled', function () {
		deepEqual(mainModule._MSTOperations.MSTStringLines('\n'), []);
	});

	it('includes if filled', function () {
		deepEqual(mainModule._MSTOperations.MSTStringLines('alfa\nbravo\n'), ['alfa', 'bravo']);
	});

});

describe('MSTStringIsMatch', function testMSTStringIsMatch () {

	it('throws if param1 not string', function() {
		throws(function() {
			mainModule._MSTOperations.MSTStringIsMatch(null, /alfa/);
		}, /MSTErrorInputNotValid/);
	});

	it('throws if param2 not RegExp', function() {
		throws(function() {
			mainModule._MSTOperations.MSTStringIsMatch('', null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns false if no match', function () {
		deepEqual(mainModule._MSTOperations.MSTStringIsMatch('alfa', /bravo/), false);
	});
	
	it('returns true', function () {
		deepEqual(mainModule._MSTOperations.MSTStringIsMatch('alfa', /alfa/), true);
	});

});

describe('MSTStringMatch', function testMSTStringMatch () {

	it('throws if param1 not string', function() {
		throws(function() {
			mainModule._MSTOperations.MSTStringMatch(null, /alfa/);
		}, /MSTErrorInputNotValid/);
	});

	it('throws if param2 not RegExp', function() {
		throws(function() {
			mainModule._MSTOperations.MSTStringMatch('', null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns array', function () {
		deepEqual(mainModule._MSTOperations.MSTStringMatch('alfa', /bravo/), []);
	});
	
	it('excludes if no capture', function () {
		deepEqual(mainModule._MSTOperations.MSTStringMatch('alfa', /alfa/), []);
	});
	
	it('includes if capture', function () {
		deepEqual(mainModule._MSTOperations.MSTStringMatch('alfa', /(alfa)/), [{ 1: 'alfa' }]);
	});

});

describe('MSTArrayFirst', function testMSTArrayFirst () {

	it('throws if not array', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayFirst(null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns undefined if none', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayFirst([]), undefined);
	});
	
	it('returns first item', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayFirst(['alfa', 'bravo']), 'alfa');
	});

});

describe('MSTArrayLast', function testMSTArrayLast () {

	it('throws if not array', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayLast(null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns undefined if none', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayLast([]), undefined);
	});
	
	it('returns last item', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayLast(['alfa', 'bravo']), 'bravo');
	});

});

describe('MSTArrayAccess', function testMSTArrayAccess () {

	it('throws if param1 not array', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayAccess(null, 1);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns property access', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayAccess(['alfa', 'bravo'], 0), 'alfa');
	});

});

describe('MSTArrayReverse', function testMSTArrayReverse () {

	it('throws if not array', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayReverse(null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns input', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayReverse([]), []);
	});
	
	it('reverses input', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayReverse(['alfa', 'bravo']), ['bravo', 'alfa']);
	});

});

describe('MSTArrayUnique', function testMSTArrayUnique () {

	it('throws if not array', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayUnique(null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns input', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayUnique([]), []);
	});
	
	it('removes duplicates', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayUnique(['alfa', 'alfa']), ['alfa']);
	});

});

describe('MSTArrayIsMatch', function testMSTArrayIsMatch () {

	it('throws if param1 not array', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayIsMatch(null, /alfa/);
		}, /MSTErrorInputNotValid/);
	});

	it('throws if param2 not RegExp', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayIsMatch([], null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns input', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayIsMatch([], /alfa/), []);
	});
	
	it('excludes if no match', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayIsMatch(['alfa'], /bravo/), []);
	});
	
	it('includes', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayIsMatch(['alfa'], /alfa/), ['alfa']);
	});

});

describe('MSTArrayMatch', function testMSTArrayMatch () {

	it('throws if param1 not array', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayMatch(null, /alfa/);
		}, /MSTErrorInputNotValid/);
	});

	it('throws if param2 not RegExp', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayMatch([], null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns input', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayMatch([], /alfa/), []);
	});
	
	it('excludes if no capture', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayMatch(['alfa'], /alfa/), []);
	});
	
	it('excludes if no match', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayMatch(['alfa'], /(bravo)/), []);
	});
	
	it('includes', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayMatch(['alfa'], /(alfa)/), [{ 1: 'alfa' }]);
	});

});

describe('MSTArrayRemap', function testMSTArrayRemap () {

	it('throws if param1 not array', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayRemap(null, '');
		}, /MSTErrorInputNotValid/);
	});

	it('throws if param2 not string', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayRemap([], null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns array', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayRemap([], ''), []);
	});
	
	it('parses expression', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayRemap([{ alfa: 'bravo' }], 'charlie: $alfa'), [{ charlie: 'bravo' }]);
	});

});

describe('MSTArrayPrint', function testMSTArrayPrint () {

	it('throws if param1 not array', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayPrint(null, '');
		}, /MSTErrorInputNotValid/);
	});

	it('throws if param2 not string', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayPrint([], null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns array', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayPrint([], ''), []);
	});
	
	it('prints expression', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayPrint([{ alfa: 'bravo' }], 'charlie $alfa'), ['charlie bravo']);
	});

});

describe('MSTArrayGroup', function testMSTArrayGroup () {

	it('throws if param1 not array', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayGroup(null, '');
		}, /MSTErrorInputNotValid/);
	});

	it('throws if param2 not string', function() {
		throws(function() {
			mainModule._MSTOperations.MSTArrayGroup([], null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns object', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayGroup([], ''), {});
	});
	
	it('groups by param2', function () {
		deepEqual(mainModule._MSTOperations.MSTArrayGroup([{ alfa: 'bravo' }], 'alfa'), { bravo: [{ alfa: 'bravo' }] });
	});

});

describe('MSTObjectRemap', function testMSTObjectRemap () {

	it('throws if param1 not object', function() {
		throws(function() {
			mainModule._MSTOperations.MSTObjectRemap(null, '');
		}, /MSTErrorInputNotValid/);
	});

	it('throws if param2 not string', function() {
		throws(function() {
			mainModule._MSTOperations.MSTObjectRemap({}, null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns object', function () {
		deepEqual(mainModule._MSTOperations.MSTObjectRemap({}, ''), {});
	});
	
	it('parses expression object', function () {
		deepEqual(mainModule._MSTOperations.MSTObjectRemap({ alfa: 'bravo' }, 'charlie: $alfa'), { charlie: 'bravo' });
	});

});

describe('_MSTObjectRemap', function test_MSTObjectRemap () {

	it('throws if not string', function() {
		throws(function() {
			mainModule._MSTOperations._MSTObjectRemap(null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns function', function () {
		deepEqual(typeof mainModule._MSTOperations._MSTObjectRemap(''), 'function');
	});

	context('callback', function () {
		
		it('throws if not object', function () {
			throws(function () {
				mainModule._MSTOperations._MSTObjectRemap('')(null)
			}, /MSTErrorInputNotValid/);
		});

		it('returns object', function () {
			deepEqual(mainModule._MSTOperations._MSTObjectRemap('')({}), {});
		});

		it('excludes if no key', function () {
			deepEqual(mainModule._MSTOperations._MSTObjectRemap(': $1')({ 1: 2 }), {});
		});

		it('excludes if no sign', function () {
			deepEqual(mainModule._MSTOperations._MSTObjectRemap('alfa: 1')({ 1: 2 }), {});
		});

		it('excludes if no colon', function () {
			deepEqual(mainModule._MSTOperations._MSTObjectRemap('alfa $1')({ 1: 2 }), {});
		});

		it('excludes if multiple colons', function () {
			deepEqual(mainModule._MSTOperations._MSTObjectRemap('alfa: $1: bravo')({ 1: 2 }), {});
		});

		it('excludes if no match', function () {
			deepEqual(mainModule._MSTOperations._MSTObjectRemap('alfa: $0')({ 1: 2 }), {});
		});

		it('includes if match', function () {
			deepEqual(mainModule._MSTOperations._MSTObjectRemap('alfa: $1')({ 1: 2 }), { alfa: 2 });
		});

		it('includes if no whitespace', function () {
			deepEqual(mainModule._MSTOperations._MSTObjectRemap('alfa:$1')({ 1: 2 }), { alfa: 2 });
		});

		it('includes multiple', function () {
			deepEqual(mainModule._MSTOperations._MSTObjectRemap('alfa: $1, bravo: $3')({ 1: 2, 3: 4 }), { alfa: 2, bravo: 4 });
		});
	
	});

});

describe('MSTObjectPrint', function testMSTObjectPrint () {

	it('throws if param1 not object', function() {
		throws(function() {
			mainModule._MSTOperations.MSTObjectPrint(null, '');
		}, /MSTErrorInputNotValid/);
	});

	it('throws if param2 not string', function() {
		throws(function() {
			mainModule._MSTOperations.MSTObjectPrint({}, null);
		}, /MSTErrorInputNotValid/);
	});
	
	it('returns param2', function () {
		deepEqual(mainModule._MSTOperations.MSTObjectPrint({}, 'alfa'), 'alfa');
	});
	
	it('substitutes variable', function () {
		deepEqual(mainModule._MSTOperations.MSTObjectPrint({ alfa: 'bravo' }, 'charlie $alfa'), 'charlie bravo');
	});

});
