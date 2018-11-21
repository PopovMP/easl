"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('for loop', function () {
    it('loop', function () {
        assert.strictEqual(easl.evaluate(` 
                {let n 0 }
                {for e [1 2 3 4 5]
                    {set! n (n + e)} }
                n                                      `), 15);
    });

    it('break', function () {
        assert.strictEqual(easl.evaluate(`
                {let n 0}
                {for e [1 2 3 4 5]
                    {if (e > 2) break}
                    {set! n (n + e)} }
                n                                      `), 3);
    });

    it('continue', function () {
        assert.strictEqual(easl.evaluate(`
                {let n 0}
                {for e [1 2 3 4 5]
                    {if ((e % 2) = 1) continue}
                    {set! n (n + e)} }
                n                                      `), 6);
    });

    it('the range can be an expression', function () {
        assert.strictEqual(easl.evaluate(` 
                {let n 0 }
                {for e (list.range 1 5)
                    {set! n (n + e)} }
                n                                      `), 15);
    });

    it('the range elements can be an expression', function () {
        assert.strictEqual(easl.evaluate(` 
                {let n 0 }
                {for e [(1 + 2) (2 + 3)]
                    {set! n (n + e)} }
                n                                      `), 8);
    });

    it('the element symbol is not available after the loop', function () {
        assert.strictEqual(easl.evaluate(` 
                {for e [1]
                    (2 * e) }
                e                                      `), "Error: Unbound identifier: e");
    });

    it('the loop body is a scope', function () {
        assert.strictEqual(easl.evaluate(` 
                {for e [1]
                    {let a e} }
                a                                      `), "Error: Unbound identifier: a");
    });
});
