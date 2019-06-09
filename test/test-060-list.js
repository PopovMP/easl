"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('Eval basics', function () {
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

    describe('Call list', function () {
        it('get list length of empty list', function () {
            assert.strictEqual(easl.evaluate("{let lst []} (lst)"), 0);
        });
        it('get list length', function () {
            assert.strictEqual(easl.evaluate("{let lst [3 5]} (lst)"), 2);
        });
        it('get element', function () {
            assert.strictEqual(easl.evaluate("{let lst [3]} (lst 0)"), 3);
        });
        it('get element calculate index', function () {
            assert.strictEqual(easl.evaluate("{let lst [3]} (lst (- 5 5))"), 3);
        });
        it('set element', function () {
            assert.deepStrictEqual(easl.evaluate("{let lst [3]} (lst 0 5)"), [5]);
        });
        it('set element calculate index and value', function () {
            assert.deepStrictEqual(easl.evaluate("{let lst [3]} (lst (- 5 5) (+ 3 2))"), [5]);
        });
    });
});
