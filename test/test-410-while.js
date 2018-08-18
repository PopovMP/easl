"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();


describe('while loop', function () {
    it('while loop', function () {
        assert.strictEqual(easl.evaluate(` 
                {let n 1 }

                {while (< n 10)
                    {set! n (+ n 1)} }
      
                n                                       `), 10);
    });

    it('while loop break', function () {
        assert.strictEqual(easl.evaluate(`
                {let n 0}

                {let i 0}
                {while (< i 100)
                    {set! i (+ i 1)}
                    {if (> i 10)
                        break}
                    {set! n (+ n 1)} }

                n                                      `), 10);
    });

    it('while loop continue', function () {
        assert.strictEqual(easl.evaluate(`
                {let n 0}

                {let i 0}
                {while (< i 100)
                    {set! i (+ i 1)}
                    {if (= (% i 2) 1)
                        continue}
                    {set! n (+ n 1)} }

                n                                      `), 50);
    });
});

