"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('repeat loop', function () {
    it('loop', function () {
        assert.strictEqual(easl.evaluate(` 
                {let n 0 }
                {repeat 5
                    {inc! n} }
                n                                      `), 5);
    });

    it('break', function () {
        assert.strictEqual(easl.evaluate(`
                {let n 0}
                {repeat 5
                    {if (n > 2) break}
                    {inc! n} }
                n                                      `), 3);
    });

    it('the count can be an expression', function () {
        assert.strictEqual(easl.evaluate(` 
                {let n 0 }
                {repeat (list.length (list.range 1 5))
                    {inc! n} }
                n                                      `), 5);
    });

    it('the loop body is a scope', function () {
        assert.strictEqual(easl.evaluate(` 
                {repeat 1
                    {let a 5} }
                a                                      `), "Error: Unbound identifier: a");
    });
});