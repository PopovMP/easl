"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

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

    it('(if true 1) → 1', function () {
        assert.strictEqual(easl.evaluate("(if true 1)"), 1);
    });

    it('(if false 1) → null', function () {
        assert.strictEqual(easl.evaluate("(if false 1)"), null);
    });

    it('when truthy "if" evaluates only the "than clause"', function () {
        assert.strictEqual(easl.evaluate("(if true 1 a)"), 1);
    });

    it('when faulty "if" evaluates only the "else clause"', function () {
        assert.strictEqual(easl.evaluate("(if false a 1)"), 1);
    });

    it ("truthy condition returns builtin function", function () {
        assert.strictEqual(easl.evaluate("((if true + -) 4 3)"), 7);
    });

    it ("faulty condition returns builtin function", function () {
        assert.strictEqual(easl.evaluate("((if false + -) 4 3)"), 1);
    });
});
