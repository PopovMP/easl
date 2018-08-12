"use strict";

const assert = require("assert");
const Parser = require("../index").Parser;

describe('Parser', function () {
    describe('#Parser.lexer', function () {
        it('lexer 1', function () {
            assert.deepStrictEqual(Parser.lexer("1"), ["1"]);
        });
        it('lexer 2', function () {
            assert.deepStrictEqual(Parser.lexer("(+ a b)"), ['(', '+', 'a', 'b', ')']);
        });
        it('lexer 3', function () {
            assert.deepStrictEqual(Parser.lexer("{function hello [a b] (+ a b)}"),
                ['{', 'function', 'hello', '[', 'a', 'b', ']', '(', '+', 'a', 'b', ')', '}']);
        });
        // it('lexer 4 - empty string', function () {
        //     assert.deepStrictEqual(Parser.lexer('""'), [""]);
        // });
        it('Multiple expr', function () {
            assert.deepStrictEqual(Parser.lexer("1 2"), ["1", "2"]);
        });

    });

    describe('#Parser.quoteSymbols', function () {
        it('quote 1', function () {
            assert.deepStrictEqual(Parser.quoteSymbols(Parser.lexer("(sum a 2)")), ['(', '"sum"', '"a"', '2', ')']);
        });
        it('quote 2', function () {
            assert.deepStrictEqual(Parser.quoteSymbols(Parser.lexer("[a 2]")), ['[', '"a"', '2', ']']);
        });
        it('quote 3 multiple expr', function () {
            assert.deepStrictEqual(Parser.quoteSymbols(Parser.lexer("1 2 a")), [ '1', '2', '"a"' ]);
        });
    });

    describe('#Parser.replaceParens', function () {
        it('parens 1', function () {
            const lexTree = Parser.quoteSymbols(Parser.lexer("[a 2]"));
            assert.deepStrictEqual(Parser.replaceParens(lexTree), ['[', '"list"', '"a"', '2', ']']);
        });
        it('parens 1', function () {
            const lexTree = Parser.quoteSymbols(Parser.lexer("[]"));
            assert.deepStrictEqual(Parser.replaceParens(lexTree), ['[', '"list"', ']']);
        });
        it('no parens', function () {
            const lexTree = Parser.quoteSymbols(Parser.lexer("1 2 a"));
            assert.deepStrictEqual(Parser.replaceParens(lexTree), [ '1', '2', '"a"' ]);
        });
    });

    describe('#Parser.joinLexTree', function () {
        it('join 1', function () {
            assert.deepStrictEqual(Parser.joinLexTree(['[', '"list"', '"a"', '2', ']']), '["list","a",2]');
        });
        it('join multiple expr with no parens', function () {
            assert.deepStrictEqual(Parser.joinLexTree([ '1', '2', '"a"' ]), '1,2,"a"');
        });
    });

    describe('#Parser.parser', function () {
        it('parse 1', function () {
            const codeText = "1";
            const tree = JSON.stringify(Parser.parse(codeText));
            assert.deepStrictEqual(tree, '[1]');
        });
        it('parse 2', function () {
            const codeText = "1 2 a";
            const tree = JSON.stringify(Parser.parse(codeText));
            assert.deepStrictEqual(tree, '[1,2,"a"]');
        });

        it('parse 2', function () {
            const codeText = "  (   let    fac (  [   n  5]    )  ( if (zero? n) 1 (*   n (fac (+ n 1) )   )  )    )";
            const tree = JSON.stringify(Parser.parse(codeText));
            assert.deepStrictEqual(tree, '[["let","fac",[["list","n",5]],["if",["zero?","n"],1,["*","n",["fac",["+","n",1]]]]]]');
        });
    });
});
