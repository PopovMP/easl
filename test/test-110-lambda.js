"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('Eval lambda', function () {

    describe('lambda', function () {
        it('((lambda () (5))) → 5', function () {
            assert.strictEqual(easl.evaluate("((lambda () (5)))"), 5);
        });
        it('((lambda () (+ 2 3))) → 5', function () {
            assert.strictEqual(easl.evaluate("((lambda () (+ 2 3)))"), 5);
        });
        it('((lambda (a) (+ a 1)) 5) → 6', function () {
            assert.strictEqual(easl.evaluate("((lambda (a) (+ a 1)) 5)"), 6);
        });
        it('((lambda (a b) (+ a b)) 5 6) → 11', function () {
            assert.strictEqual(easl.evaluate("((lambda (a b) (+ a b)) 5 6)"), 11);
        });
        it('((lambda (a b) (+ a b)) (+ 2 3) (- 10 4)) → 11', function () {
            assert.strictEqual(easl.evaluate("((lambda (a b) (+ a b)) (+ 2 3) (- 10 4))"), 11);
        });
        it('(((lambda () (lambda (a b) (+ a b)))) 2 3) → 5', function () {
            assert.strictEqual(easl.evaluate("(((lambda () (lambda (a b) (+ a b)))) 2 3)"), 5);
        });
    });
});
