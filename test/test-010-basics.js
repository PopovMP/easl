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
        it('string: "John" → "John"', function () {
            assert.strictEqual(easl.evaluate('"John"'), "John");
        });
    });

    describe('List declaration', function () {
        it('empty list: [] → []', function () {
            assert.deepStrictEqual(easl.evaluate("[]"), []);
        });
        it('empty list: (list) → []', function () {
            assert.deepStrictEqual(easl.evaluate("(list)"), []);
        });
        it('non empty num list', function () {
            assert.deepStrictEqual(easl.evaluate("(list 1 2 3)"), [1, 2, 3]);
        });
        it('non empty string list', function () {
            assert.deepStrictEqual(easl.evaluate(` (list "1" "2" "3") `), ["1", "2", "3"]);
        });
        it('non empty list: [1 2 3] → [1 2 3]', function () {
            assert.deepStrictEqual(easl.evaluate("[1 2 3]"), [1, 2, 3]);
        });
        it('non empty list with num expr', function () {
            assert.deepStrictEqual(easl.evaluate(`["a" (+ "a" "b") "b"]`), ["a", "ab", "b"]);
        });
    });

    describe('String constructor', function () {
        it('empty string: (string) → ""', function () {
            assert.strictEqual(easl.evaluate("(string)"), "");
        });
        it('one string: (string Hello) → "Hello"', function () {
            assert.strictEqual(easl.evaluate("(string Hello)"), "Hello");
        });
        it('multiple strings: (string Hello World!) → "Hello World!"', function () {
            assert.strictEqual(easl.evaluate("(string Hello World!)"), "Hello World!");
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
            assert.strictEqual(easl.evaluate("1 2"), 2);
        });
        it('3 (+ 1 1) → 2', function () {
            assert.strictEqual(easl.evaluate("3 (+ 1 1)"), 2);
        });
    });
});
