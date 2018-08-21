"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('Eval basics', function () {
    describe('Built in constants', function () {
        it('digits: 1 → 1', function () {
            assert.strictEqual(easl.evaluate("1"), 1);
        });
        it('null: null → null', function () {
            assert.strictEqual(easl.evaluate("null"), null);
        });
        it('boolean: true → true', function () {
            assert.strictEqual(easl.evaluate("true"), true);
        });
        it('boolean: false → false', function () {
            assert.strictEqual(easl.evaluate("false"), false);
        });
        it('string:\'"John"\' → "John"', function () {
            assert.strictEqual(easl.evaluate('"John"'), "John");
        });
    });

    describe('Faulty values', function () {
        it('false: (if false 1 2) → 2', function () {
            assert.strictEqual(easl.evaluate("(if false 1 2)"), 2);
        });
        it('null: (if null 1 2) → 2', function () {
            assert.strictEqual(easl.evaluate("(if null 1 2)"), 2);
        });
        it('empty list: (if [] 1 2) → 2', function () {
            assert.strictEqual(easl.evaluate("(if [] 1 2)"), 2);
        });
        it('empty string', function () {
            assert.strictEqual(easl.evaluate('(if "" 1 2)'), 2);
        });
        it('zero: (if 0 1 2) → 2', function () {
            assert.strictEqual(easl.evaluate("(if 0 1 2)"), 2);
        });
    });

    describe('Truthy values', function () {
        it('true: (if true 1 2) → 1', function () {
            assert.strictEqual(easl.evaluate("(if true 1 2)"), 1);
        });
        it('non empty list: (if [1] 1 2) → 1', function () {
            assert.strictEqual(easl.evaluate("(if [1] 1 2)"), 1);
        });
        it('empty string', function () {
            assert.strictEqual(easl.evaluate('(if "hello" 1 2)'), 1);
        });
        it('number: (if 42 1 2) → 1', function () {
            assert.strictEqual(easl.evaluate("(if 42 1 2)"), 1);
        });
    });

    describe('List declaration', function () {
        it('empty list: [] → []', function () {
            assert.deepStrictEqual(easl.evaluate("[]"), []);
        });
        it('empty list: (list) → []', function () {
            assert.deepStrictEqual(easl.evaluate("(list)"), []);
        });
        it('non empty list: (list 1 2 3) → [1 2 3]', function () {
            assert.deepStrictEqual(easl.evaluate("(list 1 2 3)"), [1, 2, 3]);
        });
        it('non empty list: [1 2 3] → [1 2 3]', function () {
            assert.deepStrictEqual(easl.evaluate("[1 2 3]"), [1, 2, 3]);
        });
        it('non empty list: [1 (- 5 3) 3] → [1 2 3]', function () {
            assert.deepStrictEqual(easl.evaluate("[1 (- 5 3) 3]"), [1, 2, 3]);
        });
    });

    describe('Number operators', function () {
        it('add: (+ 1 2) → 3', function () {
            assert.strictEqual(easl.evaluate("(+ 1 2)"), 3);
        });
        it('add: (+ (+ 1 2) 3) → 6', function () {
            assert.strictEqual(easl.evaluate("(+ (+ 1 2) 3)"), 6);
        });
        it('subtract: (- 3 1) → 2', function () {
            assert.strictEqual(easl.evaluate("(- 3 1)"), 2);
        });
        it('subtract: (- (+ 3 2) 1) → 4', function () {
            assert.strictEqual(easl.evaluate("(- (+ 3 2) 1)"), 4);
        });
        it('modulo: (% 13 2) → 1', function () {
            assert.strictEqual(easl.evaluate("(% 13 2)"), 1);
        });
        it('modulo: (% 14 2) → 0', function () {
            assert.strictEqual(easl.evaluate("(% 14 2)"), 0);
        });
    });

    describe('Eval multiple expressions', function () {
        it('1 2 → 2', function () {
            assert.deepStrictEqual(easl.evaluate("1 2"), 2);
        });
        it('3 (+ 1 1) → 2', function () {
            assert.deepStrictEqual(easl.evaluate("3 (+ 1 1)"), 2);
        });
    });

});
