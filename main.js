const mod = {

	MSTMassage (param1, param2, param3 = {}) {
		if (typeof param1 !== 'string') {
			throw new Error('MSTErrorInputNotValid');
		}

		if (typeof param2 !== 'string') {
			throw new Error('MSTErrorInputNotValid');
		}

		if (typeof param3 !== 'object' || param3 === null) {
			throw new Error('MSTErrorInputNotValid');
		}

		if (typeof param3.MSTOptionTrace !== 'undefined' && typeof param3.MSTOptionTrace !== 'function') {
			throw new Error('MSTErrorInputNotValid');
		}

		return mod._MSTMassageTerminate(mod._MSTMassageOperations(param2, Object.assign(param3, {
			MSTOptionMassageInput: param1,
		})).reduce(function (coll, item) {
			return item(coll);
		}, param1));
	},

	_MSTMassageOperations (param1, options = {}) {
		if (typeof param1 !== 'string') {
			throw new Error('MSTErrorInputNotValid');
		}

		if (options.MSTOptionMarkdownParser && !mod.__MSTIsMarkdownParser(options.MSTOptionMarkdownParser)) {
			throw new Error('MSTErrorMarkdownParserNotValid');
		}

		if (options.MSTOptionContext && mod._MSTMassageType(options.MSTOptionContext) !== 'Object') {
			throw new Error('MSTErrorInputNotValid');
		}

		return mod.___MSTMassageOperationStrings(param1).map(function (operationString, operationIndex) {
			if (options.MSTOptionTrace)
				options.MSTOptionTrace(operationIndex, 'MSTTraceOperation', operationString);
			
			const matchingOperations = mod.__MSTMassageOperations().concat(options.MSTOptionMarkdownParser ? mod.__MSTMassageOperationsMarkdown() : []).filter(function (e) {
				return operationString.match(e.MSTOperationPattern);
			});

			if (!matchingOperations.length && operationString === 'markdown') {
				throw new Error('MSTErrorMarkdownParserNotSet');
			}

			if (!matchingOperations.length) {
				throw new Error('MSTErrorIdentifierNotValid');
			}

			return function singularCallback (operationInput, callbackContext = {}) {
				if (mod.__MSTIsGroup(operationInput)) {
					return mod.___MSTOperationFunctionReturnValue_Group(operationInput, operationString, matchingOperations, singularCallback);
				}
					
				const operation = matchingOperations.filter(function (e) {
					if (!e.MSTOperationInputTypes) {
						return true;
					}

					const param1Type = mod._MSTMassageInputTypes(e.MSTOperationInputTypes)[0];
						
					if (mod._MSTMassageType(operationInput) === param1Type) {
						return true;
					}
						
					if (mod._MSTMassageType(operationInput) === 'MarkdownTree' && param1Type === 'String') {
						return true;
					}

					return false;
				}).shift();
					
				if (!operation && Array.isArray(operationInput) && matchingOperations[0]) {
					return operationInput.map(singularCallback);
				}

				if (!operation) {
					throw new Error('MSTErrorIdentifierNotValid');
				}

				if (mod.__MSTIsMarkdownTree(operationInput) && mod._MSTMassageInputTypes(operation.MSTOperationInputTypes || '').shift() === 'String') {
					operationInput = operationInput.MSTMarkdownTreeSource;
				}

				if (options.MSTOptionTrace)
					options.MSTOptionTrace(operationIndex, 'MSTTraceInput', (function(e) {
						if (mod.__MSTIsMarkdownTree(e)) {
							return e.MSTMarkdownTreeSource
						}

						return e;
					})(operationInput));

				const match = operationString.match(operation.MSTOperationPattern);

				const operationArguments = [].concat((function () {
					if (mod._MSTMassageInputTypes(operation.MSTOperationInputTypes || '')[1] === 'Regex') {
						return new RegExp(match[1], match[2]);
					}

					if (mod._MSTMassageInputTypes(operation.MSTOperationInputTypes || '')[1] === 'MarkdownParser') {
						return options.MSTOptionMarkdownParser;
					}

					if (typeof match.index === 'undefined') {
						return;
					}
						
					let outputData = match[1];

					if (mod._MSTMassageInputTypes(operation.MSTOperationInputTypes || '')[1] === 'String') {
						const context = Object.assign(Object.assign({
							input: options.MSTOptionMassageInput,
						}, options.MSTOptionContext), callbackContext);

						if (mod._MSTMassageType(operationInput) === 'Object') {
							Object.assign(context, operationInput);
						}

						outputData = mod._MSTOperations.__MSTPrintSubExpressions(context, outputData).reverse().reduce(function (coll, item) {
							return [
								coll.slice(0, item.index),
								item.replace,
								coll.slice(item.index + item.length),
							].join('');
						}, outputData);
					}

					return outputData;
				})() || []);

				if (options.MSTOptionTrace && operationArguments.length)
					options.MSTOptionTrace(operationIndex, 'MSTTraceArguments', operationArguments);

				return operation.MSTOperationCallback(...[operationInput].concat(operationArguments));
			};
		});
	},

	___MSTOperationFunctionReturnValue_Group (operationInput, operationString, matchingOperations, singularCallback) {
		const inputData = operationInput.MSTGroupValue;

		const isJoin = matchingOperations.length === 1 && operationString.match(/^join/) && operationString.match(matchingOperations[0].MSTOperationPattern);

		if (isJoin && !Array.isArray(Object.values(inputData)[0])) {
			return singularCallback(Object.values(inputData));
		}

		operationInput.MSTGroupValue = Object.keys(inputData).reduce(function (coll, item) {
			const callbackContext = {};
			callbackContext[operationInput.MSTGroupKey] = item;

			if (isJoin || !Array.isArray(coll[item])) {
				coll[item] = singularCallback(coll[item], callbackContext);
			} else {
				coll[item] = coll[item].map(function (e) {
					return singularCallback(e, callbackContext);
				});
			}

			return coll;
		}, inputData);

		return operationInput;
	},

	__MSTIsMarkdownParser (inputData) {
		if (typeof inputData !== 'function') {
			return false;
		}

		return true;
	},

	__MSTMassageOperationStrings (inputData) {
		return [].concat.apply([], [inputData.split('.')[0]].concat((inputData.split('').reverse().join('').match(/(\][^]+?\[)?(\)[^]+?\()?(\w+)\./g) || []).map(function (e) {
			e = e.split('').reverse().join('');

			const match = e.match(/(\[[^]+\])?$/);

			return [e.slice(0, match.index).split('.').slice(1).join('.')].concat(match[0] || []);
		}).reverse()));
	},

	___MSTMassageOperationStrings (inputData) {
		// console.log(['START', inputData, inputData.length]);
		return mod.____MSTMassageOperationStrings(inputData).operationStrings;
	},

	____MSTMassageOperationStrings (inputData, options = {}) {
		let state = {};
		let lastIndex;

		return {
			operationStrings: inputData.split('').reduce(function (coll, item, index, original) {
				function stateVisual() {
					return [].concat(inputData, inputData.split('').map(function (e, i) {
						return i === index ? `${ item }:${ index }` : ' ';
					}).join(''), state.nestStart ? inputData.split('').map(function (e, i) {
						return i === state.nestStart ? `${ inputData[state.nestStart] }:${ state.nestStart } nestStart` : ' ';
					}).join('') : [], state.nestEnd ? inputData.split('').map(function (e, i) {
						return i === state.nestEnd ? `${ inputData[state.nestEnd] }:${ state.nestEnd } nestEnd` : ' ';
					}).join('') : [], state);
				}

				if (state.delegateStart && index >= state.delegateStart) {
					return coll;
				}

				state = ({
					'$': function () {
						if (state.nestStart) {
							return state;
						}

						if (!index && !mod.___MSTMassageIsVariable(`${ item }${ original[index + 1] || '' }`)) {
							throw new Error('MSTSyntaxErrorNoStartingVariable');
						}

						coll.push([]);

						return {
							isVariable: true,
							isIdentifier: true,
						};
					},
					'.': function () {
						if (state.nestStart) {
							return state;
						}

						coll.push([]);

						return {
							isIdentifier: true,
						};
					},
					'\\': function () {
						if (state.isRegex) {
							return state;
						}

						if (!['(', ')', '$'].includes(coll[index + 1])) {
							return state;
						}

						return Object.assign(state, {
							isEscaped: true,
						});
					},
					'(': function () {
						if (state.nestStart) {
							return state;
						}

						if (state.isEscaped) {
							delete state.isEscaped;

							return state;
						}

						const nestStart = index + 1;

						let regexMatch = original.slice(nestStart).join('').match(/^\/[^]*\/[a-z]?\)/);

						if (regexMatch) {
							return {
								nestStart,
								nestEnd: nestStart + regexMatch[0].slice(0, -1).length - 1,
								isRegex: true,
							};
						}

						// console.log(['NEST'].concat(stateVisual()));
						const object = mod.____MSTMassageOperationStrings(original.slice(nestStart).join(''), {
							MSTOptionIsRecursive: true,
						});

						if (nestStart + object.lastIndex + 1 === original.length) {
							throw new Error('MSTSyntaxErrorNoClosingParenthesis');
						}
						// console.log(['-', object]);

						return {
							nestStart,
							nestEnd: nestStart + object.lastIndex,
						};
					},
					')': function () {
						if (state.nestStart && index > state.nestEnd) {
							return {};
						}

						if (state.nestStart) {
							return state;
						}

						if (state.delegateStart) {
							return state;
						}

						if (state.isEscaped) {
							delete state.isEscaped;

							return state;
						}

						return {
							delegateStart: index,
						};
					},
					'[': function () {
						if (state.isRegex) {
							return state;
						}

						coll.push([]);

						return {
							isBracket: true,
						};
					},
				}[item] || function () {
					if (!index && !options.MSTOptionIsRecursive) {
						throw new Error('MSTSyntaxErrorNoStartingVariable');

						return {
							delegateStart: index,
						};
					}

					if (!options.MSTOptionIsRecursive && state.isVariable && !mod.___MSTMassageIsVariable(Array.from(coll).pop().join('').concat(item))) {
						return {
							delegateStart: index,
						};
					}

					if (!state.isVariable && state.isIdentifier && !mod.___MSTMassageIsIdentifier(Array.from(coll).pop().join('').concat(item))) {
						coll.push([]);

						return {
							delegateStart: index,
						};
					}

					if (!options.MSTOptionIsRecursive && !state.isVariable && !state.isIdentifier && !state.nestStart && !state.isBracket) {
						return {
							delegateStart: index,
						};
					}

					return state;
				})();

				if (!Array.isArray(Array.from(coll).pop())) {
					coll.push([]);
				}

				if ((function() {
					if (state.isIdentifier && item === '.') {
						return false;
					}
					
					if (state.delegateStart && index >= state.delegateStart) {
						return false;
					}

					return true;
				})()) {
					Array.from(coll).pop().push(item);
					lastIndex = index;
				}

				return coll;
			}, []).map(function (e) {
				return e.join('');
			}).filter(function (e) {
				return !!e;
			}),
			lastIndex,
		};
	},

	___MSTMassageIsVariable (inputData) {
		return inputData[0] === '$' && mod.___MSTMassageIsIdentifier(inputData.slice(1));
	},

	___MSTMassageIsIdentifier (inputData) {
		return !!inputData.match(/^[a-z0-9]+$/i);
	},

	_MSTMassageInputTypes(inputData) {
		if (typeof inputData !== 'string') {
			throw new Error('MSTErrorInputNotValid');
		}

		return inputData.split(',').map(function (e) {
			return e.trim();
		}).filter(function (e) {
			return !!e;
		});
	},

	_MSTMassageType(inputData) {
		if (typeof inputData === 'string') {
			return 'String';
		}

		if (Array.isArray(inputData)) {
			return 'Array';
		}

		if (mod.__MSTIsGroup(inputData)) {
			return 'Group';
		}

		if (mod.__MSTIsMarkdownTree(inputData)) {
			return 'MarkdownTree';
		}

		if (typeof inputData === 'object' && inputData !== null) {
			return 'Object';
		}

		throw new Error('MSTErrorInputNotValid');
	},

	__MSTIsMarkdownTree (inputData) {
		if (typeof inputData !== 'object') {
			return false;
		}

		if (inputData === null) {
			return false;
		}

		if (typeof inputData.MSTMarkdownTreeSource !== 'string') {
			return false;
		}

		return true;
	},

	__MSTIsGroup (inputData) {
		if (typeof inputData !== 'object') {
			return false;
		}

		if (inputData === null) {
			return false;
		}

		if (typeof inputData.MSTGroupValue !== 'object' || inputData.MSTGroupValue === null) {
			return false;
		}

		return true;
	},

	__MSTGroupValue (inputData) {
		if (!mod.__MSTIsGroup(inputData)) {
			throw new Error('MSTErrorInputNotValid');
		}

		return inputData.MSTGroupValue;
	},

	__MSTMassageOperations () {
		return [{
			MSTOperationPattern: /^\$?input$/,
			MSTOperationCallback: mod._MSTOperations._MSTBypass,
		}, {
			MSTOperationPattern: /^lowercase$/,
			MSTOperationInputTypes: 'String',
			MSTOperationCallback: mod._MSTOperations.MSTStringLowercase,
		}, {
			MSTOperationPattern: /^split\(([^]+)\)$/,
			MSTOperationInputTypes: 'String,String',
			MSTOperationCallback: mod._MSTOperations.MSTStringSplit,
		}, {
			MSTOperationPattern: /^lines$/,
			MSTOperationInputTypes: 'String',
			MSTOperationCallback: mod._MSTOperations.MSTStringLines,
		}, {
			MSTOperationPattern: /^conform\(\/([^]+)\/(\w)?\)$/,
			MSTOperationInputTypes: 'String,Regex',
			MSTOperationCallback: mod._MSTOperations.MSTStringConform,
		}, {
			MSTOperationPattern: /^capture\(\/([^]+)\/(\w)?\)$/,
			MSTOperationInputTypes: 'String,Regex',
			MSTOperationCallback: mod._MSTOperations.MSTStringCapture,
		}, {
			MSTOperationPattern: /^prepend\(([^]+)\)$/,
			MSTOperationInputTypes: 'String,String',
			MSTOperationCallback: mod._MSTOperations.MSTStringPrepend,
		}, {
			MSTOperationPattern: /^postpend\(([^]+)\)$/,
			MSTOperationInputTypes: 'String,String',
			MSTOperationCallback: mod._MSTOperations.MSTStringPostpend,
		}, {
			MSTOperationPattern: /^first$/,
			MSTOperationInputTypes: 'Array',
			MSTOperationCallback: mod._MSTOperations.MSTArrayFirst,
		}, {
			MSTOperationPattern: /^last$/,
			MSTOperationInputTypes: 'Array',
			MSTOperationCallback: mod._MSTOperations.MSTArrayLast,
		}, {
			MSTOperationPattern: /^\[([^]+)\]$/,
			MSTOperationInputTypes: 'Array',
			MSTOperationCallback: mod._MSTOperations.MSTArrayAccess,
		}, {
			MSTOperationPattern: /^reverse$/,
			MSTOperationInputTypes: 'Array',
			MSTOperationCallback: mod._MSTOperations.MSTArrayReverse,
		}, {
			MSTOperationPattern: /^unique$/,
			MSTOperationInputTypes: 'Array',
			MSTOperationCallback: mod._MSTOperations.MSTArrayUnique,
		}, {
			MSTOperationPattern: /^group\((\w+)\)$/,
			MSTOperationInputTypes: 'Array,String',
			MSTOperationCallback: mod._MSTOperations.MSTArrayGroup,
		}, {
			MSTOperationPattern: /^conform\(\/([^]+)\/(\w)?\)$/,
			MSTOperationInputTypes: 'Array,Regex',
			MSTOperationCallback: mod._MSTOperations.MSTArrayConform,
		}, {
			MSTOperationPattern: /^capture\(\/([^]+)\/(\w)?\)$/,
			MSTOperationInputTypes: 'Array,Regex',
			MSTOperationCallback: mod._MSTOperations.MSTArrayCapture,
		}, {
			MSTOperationPattern: /^remap\(([^]+)\)$/,
			MSTOperationInputTypes: 'Array,Mapping',
			MSTOperationCallback: mod._MSTOperations.MSTArrayRemap,
		// }, {
		// 	MSTOperationPattern: /^print\(([^]+)\)$/,
		// 	MSTOperationInputTypes: 'Array,String',
		// 	MSTOperationCallback: mod._MSTOperations.MSTArrayPrint,
		}, {
			MSTOperationPattern: /^join\(([^]+)\)$/,
			MSTOperationInputTypes: 'Array,String',
			MSTOperationCallback: mod._MSTOperations.MSTArrayJoin,
		}, {
			MSTOperationPattern: /^\[([^]+)\]$/,
			MSTOperationInputTypes: 'Object',
			MSTOperationCallback: mod._MSTOperations.MSTObjectAccess,
		}, {
			MSTOperationPattern: /^remap\(([^]+)\)$/,
			MSTOperationInputTypes: 'Object,Mapping',
			MSTOperationCallback: mod._MSTOperations.MSTObjectRemap,
		}, {
			MSTOperationPattern: /^print\(([^]+)\)$/,
			MSTOperationInputTypes: 'Object,String',
			MSTOperationCallback: mod._MSTOperations.MSTObjectPrint,
		}];
	},

	__MSTMassageOperationsMarkdown () {
		return [{
			MSTOperationPattern: /^markdown$/,
			MSTOperationInputTypes: 'String,MarkdownParser',
			MSTOperationCallback: mod._MSTOperations.MSTStringMarkdown,
		}, {
			MSTOperationPattern: /^sections$/,
			MSTOperationInputTypes: 'MarkdownTree',
			MSTOperationCallback: mod._MSTOperations.MSTMarkdownSections,
		}, {
			MSTOperationPattern: /^content\(([^]+)\)$/,
			MSTOperationInputTypes: 'MarkdownTree,String',
			MSTOperationCallback: mod._MSTOperations.MSTMarkdownContent,
		}, {
			MSTOperationPattern: /^items$/,
			MSTOperationInputTypes: 'MarkdownTree',
			MSTOperationCallback: mod._MSTOperations.MSTMarkdownItems,
		}, {
			MSTOperationPattern: /^paragraphs$/,
			MSTOperationInputTypes: 'MarkdownTree',
			MSTOperationCallback: mod._MSTOperations.MSTMarkdownParagraphs,
		}];
	},

	_MSTMassageTerminate (inputData) {
		if (mod.__MSTIsGroup(inputData)) {
			inputData = mod.__MSTGroupValue(inputData);
		}

		if (mod.__MSTIsMarkdownTree(inputData)) {
			inputData = inputData.MSTMarkdownTreeSource;
		}

		if (Array.isArray(inputData)) {
			inputData = inputData.map(function (e) {
				if (mod.__MSTIsMarkdownTree(e)) {
					return e.MSTMarkdownTreeSource;
				}
				
				return e;
			});
		}

		return mod.__MSTMassageTerminateFunction(inputData)(inputData);
	},

	__MSTMassageTerminateFunction (inputData) {
		if (typeof inputData !== 'string') {
			return JSON.stringify;
		}

		return mod._MSTOperations._MSTBypass;
	},

	_MSTOperations: {
		
		_MSTBypass (inputData) {
			return inputData;
		},
		
		MSTStringLowercase (inputData) {
			if (typeof inputData !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			return inputData.toLowerCase();
		},
		
		MSTStringSplit (param1, param2) {
			if (typeof param1 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			if (typeof param2 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			return param1.split(param2);
		},
		
		MSTStringLines (inputData) {
			if (typeof inputData !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			return inputData.split('\n').filter(function (e) {
				return e.length;
			});
		},
		
		MSTStringPrepend (param1, param2) {
			if (typeof param1 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			if (typeof param2 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			return param2 + param1;
		},
		
		MSTStringPostpend (param1, param2) {
			if (typeof param1 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			if (typeof param2 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			return param1 + param2;
		},
		
		MSTStringConform (param1, param2) {
			if (typeof param1 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			if (!(param2 instanceof RegExp)) {
				throw new Error('MSTErrorInputNotValid');
			}

			return !!param1.match(param2);
		},
		
		MSTStringCapture (param1, param2) {
			if (typeof param1 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			if (!(param2 instanceof RegExp)) {
				throw new Error('MSTErrorInputNotValid');
			}

			const match = param1.match(param2);

			if (!match) {
				return [];
			}

			if (match.length <= 1) {
				return [];
			}

			return (typeof match.index !== 'undefined' ? [match] : match.map(function (e) {
				return param2.exec(e.match(param2)); // #mysterious result is null unless match is called
			})).map(function (e) {
				return e.reduce(function (coll, item, index) {
					if (index) {
						coll[index] = item;
					}

					return coll;
				}, {});
			});
		},
		
		MSTStringMarkdown (param1, param2) {
			if (typeof param1 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			if (!mod.__MSTIsMarkdownParser(param2)) {
				throw new Error('MSTErrorInputNotValid');
			}

			return Object.assign(param2(param1), {
				MSTMarkdownTreeSource: param1,
			});
		},
		
		MSTArrayFirst (inputData) {
			if (!Array.isArray(inputData)) {
				throw new Error('MSTErrorInputNotValid');
			}

			return inputData[0];
		},
		
		MSTArrayLast (inputData) {
			if (!Array.isArray(inputData)) {
				throw new Error('MSTErrorInputNotValid');
			}

			return inputData.slice(-1).pop();
		},
		
		MSTArrayAccess (param1, param2) {
			if (!Array.isArray(param1)) {
				throw new Error('MSTErrorInputNotValid');
			}

			return param1[param2] || '';
		},
		
		MSTArrayReverse (inputData) {
			if (!Array.isArray(inputData)) {
				throw new Error('MSTErrorInputNotValid');
			}

			return inputData.reverse();
		},
		
		MSTArrayUnique (inputData) {
			if (!Array.isArray(inputData)) {
				throw new Error('MSTErrorInputNotValid');
			}

			return Array.from(new Set(inputData));
		},
		
		MSTArrayConform (param1, param2) {
			if (!Array.isArray(param1)) {
				throw new Error('MSTErrorInputNotValid');
			}

			if (!(param2 instanceof RegExp)) {
				throw new Error('MSTErrorInputNotValid');
			}

			return param1.filter(function (e) {
				return e.match(param2);
			});
		},
		
		MSTArrayCapture (param1, param2) {
			if (!Array.isArray(param1)) {
				throw new Error('MSTErrorInputNotValid');
			}

			if (!(param2 instanceof RegExp)) {
				throw new Error('MSTErrorInputNotValid');
			}

			return param1.map(function (e) {
				return mod._MSTOperations.MSTStringCapture(e, param2).shift();
			}).filter(function (e) {
				return e;
			});
		},
		
		MSTArrayRemap (param1, param2) {
			if (!Array.isArray(param1)) {
				throw new Error('MSTErrorInputNotValid');
			}

			if (typeof param2 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			return param1.map(function (e) {
				return mod._MSTOperations.MSTObjectRemap(e, param2);
			});
		},
		
		MSTArrayPrint (param1, param2) {
			if (!Array.isArray(param1)) {
				throw new Error('MSTErrorInputNotValid');
			}

			if (typeof param2 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			return param1.map(function (e) {
				return mod._MSTOperations.MSTObjectPrint(e, param2);
			});
		},
		
		MSTArrayJoin (param1, param2) {
			if (!Array.isArray(param1)) {
				throw new Error('MSTErrorInputNotValid');
			}

			if (typeof param2 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			return param1.join(param2);
		},
		
		MSTArrayGroup (param1, param2) {
			if (!Array.isArray(param1)) {
				throw new Error('MSTErrorInputNotValid');
			}

			if (typeof param2 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			return {
				MSTGroupKey: param2,
				MSTGroupValue: param1.reduce(function (coll, item) {
					(coll[item[param2]] = coll[item[param2]] || []).push(item);

					return coll;
				}, {}),
			};
		},
		
		MSTObjectAccess (param1, param2) {
			if (typeof param1 !== 'object' || param1 === null) {
				throw new Error('MSTErrorInputNotValid');
			}

			return param1[param2];
		},
		
		MSTObjectRemap (param1, param2) {
			if (typeof param1 !== 'object' || param1 === null) {
				throw new Error('MSTErrorInputNotValid');
			}

			if (typeof param2 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			return mod._MSTOperations.__MSTObjectRemap(param1, param2);
		},
		
		_MSTObjectRemap (inputData) {
			if (typeof inputData !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			return function (object) {
				if (typeof object !== 'object' || object === null) {
					throw new Error('MSTErrorInputNotValid');
				}

				return inputData.split(',').map(function (e) {
					const pair = e.split(':').map(function (e) {
						return e.trim();
					});

					if (pair.length != 2) {
						return null;
					}

					if (!pair[0]) {
						return null;
					}

					if (pair[1][0] !== '$') {
						return null;
					}

					if (!Object.keys(object).includes(pair[1].slice(1))) {
						return null;
					}

					return pair;
				}).filter(function (e) {
					return e;
				}).reduce(function (coll, [key, value]) {
					coll[key] = object[value.slice(1)];

					return coll;
				}, {});
			};
		},
		
		__MSTObjectRemap (param1, param2) {
			if (typeof param1 !== 'object' || param1 === null) {
				throw new Error('MSTErrorInputNotValid');
			}

			if (typeof param2 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			if (!mod.___MSTMassageIsIdentifier(param2[0] || '')) {
				return {};
			}

			let state = {};

			return param2.split('').reduce(function (coll, item, index, original) {
				if (state.delegateStart && index >= state.delegateStart) {
					return coll;
				}

				if (state.expressionEnd && index > state.expressionEnd) {
					state = {};
				}

				state = ({
					'$': function () {
						if (state.expressionEnd) {
							return state;
						}

						const object = mod.____MSTMassageOperationStrings(original.slice(index).join(''));

						return {
							expressionEnd: index + object.lastIndex,
						};
					},
					':': function () {
						if (state.expressionEnd) {
							return state;
						}

						if (!state.isIdentifier) {
							throw new Error('MSTSyntaxErrorNoIdentifier');
						}

						coll.push([]);

						return {
							isValue: true,
						};
					},
					',': function () {
						coll.push([]);

						return {};
					},
				}[item] || function () {
					if (state.isValue && !state.expressionEnd && item !== ' ') {
						throw new Error('MSTSyntaxErrorNoStartingVariable');
					}

					if (state.isIdentifier && !mod.___MSTMassageIsIdentifier(Array.from(coll).pop().join('').concat(item))) {
						return {
							delegateStart: index,
						};
					}

					if (!Object.keys(state).length) {
						return {
							isIdentifier: true,
						};
					}

					return state;
				})();

				if (!Array.isArray(Array.from(coll).pop())) {
					coll.push([]);
				}

				if ((function() {
					if (state.delegateStart && index >= state.delegateStart) {
						return false;
					}

					if (state.expressionEnd) {
						return true;
					}

					if (state.isValue && item === ':') {
						return false;
					}

					if (item === ' ') {
						return false;
					}

					if (item === ',') {
						return false;
					}

					return true;
				})()) {
					Array.from(coll).pop().push(item);
				}

				return coll;
			}, []).map(function (e) {
				return e.join('');
			}).filter(function (e) {
				return !!e;
			}).reduce(function (coll, item, index, original) {
				if (index % 2 != 0) {
					return coll;
				}

				if (typeof original[index + 1] === 'undefined') {
					return coll;
				}

				if (typeof param1[original[index + 1].split('.')[0].slice(1)] === 'undefined') {
					return coll;
				}

				coll[item] = mod.MSTMassage(param1[original[index + 1].split('.')[0].slice(1)].toString(), ['$input'].concat(original[index + 1].split('.').slice(1)).join('.'), {
					MSTOptionContext: param1,
				});

				return coll;
			}, {});
		},
		
		MSTObjectPrint (param1, param2) {
			if (typeof param1 !== 'object' || param1 === null) {
				throw new Error('MSTErrorInputNotValid');
			}

			if (typeof param2 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			return mod._MSTOperations.__MSTPrintSubExpressions(param1, param2).reverse().reduce(function (coll, item) {
				return [
					coll.slice(0, item.index),
					item.replace,
					coll.slice(item.index + item.length),
				].join('');
			}, param2);
		},

		__MSTPrintSubExpressions (param1, param2) {
			if (typeof param1 !== 'object' || param1 === null) {
				throw new Error('MSTErrorInputNotValid');
			}

			if (typeof param2 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			return param2.split('').map(function (e, i) {
				if (e !== '$') {
					return;
				}

				return i;
			}).filter(function (e) {
				return typeof e !== 'undefined';
			}).map(function (e) {
				const object = mod.____MSTMassageOperationStrings(param2.slice(e));

				return {
					index: e,
					length: param2.slice(e, e + object.lastIndex + 1).length,
					replace: mod.MSTMassage((param1[object.operationStrings[0].slice(1)] || '').toString(), ['$input'].concat(object.operationStrings.slice(1)).filter(function (e) {
						return !!e;
					}).join('.')),
				};
			});
		},
		
		MSTMarkdownSections (inputData) {
			if (!mod.__MSTIsMarkdownTree(inputData)) {
				throw new Error('MSTErrorInputNotValid');
			}

			return inputData.children.reduce(function (coll, item) {
				if (!coll.length || item.type === 'heading') {
					return coll.concat([[item]]);
				}

				coll.slice(-1).pop().push(item);

				return coll;
			}, []).map(function (e) {
				return {
					children: e,
					MSTMarkdownTreeSource: inputData.MSTMarkdownTreeSource.slice(e[0].position.start.offset, e.slice(-1).pop().position.end.offset),
				};
			});
		},
		
		MSTMarkdownContent (param1, param2) {
			if (!mod.__MSTIsMarkdownTree(param1)) {
				throw new Error('MSTErrorInputNotValid');
			}

			if (typeof param2 !== 'string') {
				throw new Error('MSTErrorInputNotValid');
			}

			const match = mod._MSTOperations.MSTMarkdownSections(param1).filter(function (e) {
				if (e.children[0].type !== 'heading') {
					return false;
				}

				if (e.children[0].children[0].value !== param2) {
					return false;
				}

				return true;
			}).shift();

			if (!match || match.children.length === 1) {
				return '';
			}

			return Object.assign({
				children: match.children.slice(1),
				MSTMarkdownTreeSource: param1.MSTMarkdownTreeSource.slice(match.children[1].position.start.offset, match.children.slice(-1).pop().position.end.offset),
				_MSTMarkdownTreeSourceOffset: match.children[1].position.start.offset,
			});
		},
		
		MSTMarkdownItems (inputData) {
			if (!mod.__MSTIsMarkdownTree(inputData)) {
				throw new Error('MSTErrorInputNotValid');
			}

			return [].concat(...inputData.children.filter(function (e) {
				return e.type === 'list';
			}).map(function (e) {
				return e.children.filter(function(e) {
					return e.type === 'listItem';
				}).map(function (e) {
					return inputData.MSTMarkdownTreeSource.slice(e.children[0].position.start.offset - (inputData._MSTMarkdownTreeSourceOffset || 0), e.position.end.offset - (inputData._MSTMarkdownTreeSourceOffset || 0));
				});
			}));
		},
		
		MSTMarkdownParagraphs (inputData) {
			if (!mod.__MSTIsMarkdownTree(inputData)) {
				throw new Error('MSTErrorInputNotValid');
			}

			return inputData.children.filter(function (e) {
				return e.type === 'paragraph';
			}).map(function (e) {
				return e.children.filter(function(e) {
					return e.type === 'text';
				}).map(function (e) {
					return e.value;
				}).join('\n');
			});
		},

	},

};

Object.assign(exports, mod);
