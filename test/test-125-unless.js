"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('unless', function () {
    it('(unless false 1 2) → 1', function () {
        assert.strictEqual(easl.evaluate("(unless false 1 2)"), 1);
    });

    it('(unless true 1 2) → 2', function () {
        assert.strictEqual(easl.evaluate("(unless true 1 2)"), 2);
    });

    it('(unless (= 8 (+ 7 1)) 2 (+ 1 2)) → 3', function () {
        assert.strictEqual(easl.evaluate("(unless (= 8 (+ 7 1)) 2 (+ 1 2))"), 3);
    });

    it('(unless false (+ 2 2) 1) → 4', function () {
        assert.strictEqual(easl.evaluate("(unless false (+ 2 2) 1)"), 4);
    });

    it('(unless false 1) → 1', function () {
        assert.strictEqual(easl.evaluate("(unless false 1)"), 1);
    });

    it('(unless true 1) → null', function () {
        assert.strictEqual(easl.evaluate("(unless true 1)"), null);
    });

    it('when faulty "unless" evaluates only the "than clause"', function () {
        assert.strictEqual(easl.evaluate("(unless false 1 a)"), 1);
    });

    it('when truthy "unless" evaluates only the "else clause"', function () {
        assert.strictEqual(easl.evaluate("(unless true a 1)"), 1);
    });

    it ("faulty condition returns builtin function", function () {
        assert.strictEqual(easl.evaluate("((unless false + -) 4 3)"), 7);
    });

    it ("truthy condition returns builtin function", function () {
        assert.strictEqual(easl.evaluate("((unless true + -) 4 3)"), 1);
    });
});
