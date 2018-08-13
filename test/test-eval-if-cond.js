"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('Eval if, cond', function () {

    describe('if', function () {
        it('(if true 1 2) → 1', function () {
            assert.strictEqual(easl.evaluate("(if true 1 2)"), 1);
        });
        it('(if false 1 2) → 2', function () {
            assert.strictEqual(easl.evaluate("(if false 1 2)"), 2);
        });
        it('(if (= 8 (+ 7 1)) (+ 1 2) 2) → 3', function () {
            assert.strictEqual(easl.evaluate("(if (= 8 (+ 7 1)) (+ 1 2) 2)"), 3);
        });
        it('(if false 1 (+ 2 2)) → 4', function () {
            assert.strictEqual(easl.evaluate("(if false 1 (+ 2 2))"), 4);
        });

    });

    describe('cond', function () {
        it('cond 1', function () {
            assert.strictEqual(easl.evaluate(`   {cond
                                                     (true 5)}          `), 5);
        });
        it('cond 2', function () {
            assert.strictEqual(easl.evaluate(`   {cond
                                                     (true (+ 2 3))}    `), 5);
        });
        it('cond 3', function () {
            assert.strictEqual(easl.evaluate(`   {cond
                                                     (false (+ 1 2))
                                                     (true  (+ 2 3))}   `), 5);
        });
        it('cond 4', function () {
            assert.strictEqual(easl.evaluate(`   {cond
                                                    (false (+ 1 2))
                                                    (else  (+ 2 3))}    `), 5);
        });
        it('cond 5', function () {
            assert.strictEqual(easl.evaluate(`   {cond
                                                    (true (+ 1 2)
                                                          (+ 1 2)
                                                          (+ 2 3))}     `), 5);
        });
        it('cond 6', function () {
            assert.strictEqual(easl.evaluate(`   {cond
                                                    ((eq? 1 1) 5)}      `), 5);
        });
    });
});
