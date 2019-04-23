"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('infix operators', function () {
    it('(1 + 2) → 3', function () {
        assert.strictEqual(easl.evaluate("(1 + 2)"), 3);
    });
    it('(+ (1 + 2) (3 + 4)) → 10', function () {
        assert.strictEqual(easl.evaluate("(+ (1 + 2) (3 + 4))"), 10);
    });
    it('((1 + 2) + (3 + 4)) → 10', function () {
        assert.strictEqual(easl.evaluate("((1 + 2) + (3 + 4))"), 10);
    });
    it('(false or true) → true', function () {
        assert.strictEqual(easl.evaluate("(false or true)"), true);
    });
    it('(if (3 > 2) 3 2) → 3', function () {
        assert.strictEqual(easl.evaluate("(if (3 > 2) 3 2)"), 3);
    });
    it('while', function () {
        assert.strictEqual(easl.evaluate(`
            {let n 1}
            {while (n < 5)
                   (inc n) }
            n                                               `), 5);
    });
    it('variable', function () {
        assert.strictEqual(easl.evaluate(`
            {let n 1}
            (n < 5)                            `), true);
    });
    it('variable 2', function () {
        assert.strictEqual(easl.evaluate(`
            {let a 12}
            {let b 24}
            {let d1 ({if (a > b) - +} a b)}
            d1
                                        `), 36);
    });
    it('random number last', function () {
        assert.strictEqual(easl.evaluate(`
            {let random (100 * (math.random))} 
            {let type (type-of random)}
                                        `), "number");
    });
    it('random number first', function () {
        assert.strictEqual(easl.evaluate(`
            {let random ((math.random) * 100)} 
            {let type (type-of random)}
                                        `), "number");
    });
    it('custom infix operator', function () {
        assert.strictEqual(easl.evaluate(`
            {function ** (m n) (math.pow m n)}
            (2 ** 3)
                                        `), 8);
    });

});
