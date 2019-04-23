"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('while loop', function () {
    it('while loop', function () {
        assert.strictEqual(easl.evaluate(` 
                {let n 1 }
                {while (< n 3)
                    {set n (+ n 1)} }
                n                                       `), 3);
    });

    it('while loop break', function () {
        assert.strictEqual(easl.evaluate(`
                {let n 0}
                {let i 0}
                {while (< i 100)
                    {set i (+ i 1)}
                    {if (> i 2) {break}}
                    {set n (+ n 1)} }
                n                                      `), 2);
    });

    it('while loop continue', function () {
        assert.strictEqual(easl.evaluate(`
                {let n 0}
                {let i 0}
                {while (< i 10)
                    {set i (+ i 1)}
                    {if (= (% i 2) 1) {continue}}
                    {set n (+ n 1)} }
                n                                      `), 5);
    });
});

