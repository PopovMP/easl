"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('lambda', function () {
    it('({lambda () 5} ) → 5', function () {
        assert.strictEqual(easl.evaluate("({lambda () 5} )"), 5);
    });

    it('({lambda () (+ 2 3)} ) → 5', function () {
        assert.strictEqual(easl.evaluate("({lambda () (+ 2 3)} )"), 5);
    });

    it('({lambda (a) a} 5) → 5', function () {
        assert.strictEqual(easl.evaluate("({lambda (a) a} 5)"), 5);
    });

    it('({lambda a a} 5) → 5', function () {
        assert.strictEqual(easl.evaluate("({lambda a a} 5)"), 5);
    });

    it('({lambda x x} 5) → 5', function () {
        assert.strictEqual(easl.evaluate("({lambda x x} 5)"), 5);
    });

    it('({lambda a (* 2 a)} 5) → 10', function () {
        assert.strictEqual(easl.evaluate("({lambda a (* 2 a)} 5)"), 10);
    });

    it('({lambda (a) (+ a 1)} 5) → 6', function () {
        assert.strictEqual(easl.evaluate("({lambda (a) (+ a 1)} 5)"), 6);
    });

    it('({lambda (a b) (+ a b)} 5 6) → 11', function () {
        assert.strictEqual(easl.evaluate("({lambda (a b) (+ a b)} 5 6)"), 11);
    });

    it('({lambda (a b) (+ a b)} (+ 2 3) (- 10 4) ) → 11', function () {
        assert.strictEqual(easl.evaluate("({lambda (a b) (+ a b)} (+ 2 3) (- 10 4))"), 11);
    });

    it('(({lambda () {lambda (a b) (+ a b)}}) 2 3) → 5', function () {
        assert.strictEqual(easl.evaluate("(({lambda () {lambda (a b) (+ a b)}}) 2 3)"), 5);
    });

    it('lambda func-name', function () {
        assert.strictEqual(easl.evaluate("({lambda (a b) func-name} 1 2 3 4)"), "lambda");
    });

    it('lambda func-params', function () {
        assert.deepStrictEqual(easl.evaluate("({lambda (a b) func-params} 1 2 3 4)"), ['a', 'b']);
    });

    it('lambda func-args', function () {
        assert.deepStrictEqual(easl.evaluate("({lambda (a b) func-args} 1 2 3 4)"), [1, 2, 3, 4]);
    });

    it('lambda with more than one expr ', function () {
        assert.strictEqual(easl.evaluate("({lambda n {let a 5} (n + a)} 3)"), 8);
    });

    it('lambda with no args and more than one expr ', function () {
        assert.strictEqual(easl.evaluate("({lambda () {let a 5} (a + a)})"), 10);
    });

    it('Improper function', function () {
        assert.strictEqual(easl.evaluate("( {lambda () (5)} )"), "Error: Improper function: 5");
    });

    it('No params function', function () {
        assert.strictEqual(easl.evaluate("{lambda (+ 2 3)}"), "Error: Improper function");
    });

    it('No body', function () {
        assert.strictEqual(easl.evaluate("{lambda (a b)}"), "Error: Improper function");
    });

    it('lambda returns a builtin function', function () {
        assert.strictEqual(easl.evaluate("(({lambda () +}) 2 3}"), 5);
    });
});
