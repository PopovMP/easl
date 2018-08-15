"use strict";

const assert = require("assert");
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
});
