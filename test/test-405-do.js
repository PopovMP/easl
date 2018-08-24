"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('do loop', function () {
    it('do loop', function () {
        assert.strictEqual(easl.evaluate(` 
                {let n 1 }
                {do
                    {set! n (+ n 1)}
                    (< n 3) }
                n                                       `), 3);
    });

    it('do loop break', function () {
        assert.strictEqual(easl.evaluate(`
                {let n 0}
                {let i 0}
                {do
                    {set! i (+ i 1)}
                    {if (> i 2) break}
                    {set! n (+ n 1)}
                    (< i 100) }
                n                                      `), 2);
    });

    it('do loop continue', function () {
        assert.strictEqual(easl.evaluate(`
                {let n 0}
                {let i 0}
                {do
                    {set! i (+ i 1)}
                    {if (= (% i 2) 1) continue}
                    {set! n (+ n 1)}
                    (< i 10) }
                n                                      `), 5);
    });
});
