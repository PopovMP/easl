"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('for loop', function () {
    it('for loop 1', function () {
        assert.strictEqual(easl.evaluate(`  
              {let m 0}
              {for (i m) (< i 3) (+ i 1)
                  {set! m i} }
               m                                        `), 2);
    });

    it('for loop 2', function () {
        assert.strictEqual(easl.evaluate(`
                {let m 0}
                {for (i 10) (<= i (* 1 20)) (+ i 5)
                    {set! m i} }
                m                                      `), 20);
    });

    it('for loop break', function () {
        assert.strictEqual(easl.evaluate(`
                {let m 0}
                {for (i 0) (< i 3) (+ i 1)
                    {if (= i 1) break}
                    {set! m (+ m 1)} }
                m                                      `), 1);
    });

    it('for loop continue', function () {
        assert.strictEqual(easl.evaluate(`
                {let m 0}
                {for (i 0) (< i 10) (+ i 1)
                    {if (= (% i 2) 1) continue}
                    {set! m (+ m 1)} }
                m                                      `), 5);
    });

    it('the counter is not exposed after the loop', function () {
        assert.strictEqual(easl.evaluate(`
                {for (i 0) (< i 1) (+ i 1) }
                i                                      `), "Error: Unbound identifier: i");
    });

    it("the counter doesn't override a variable" , function () {
        assert.strictEqual(easl.evaluate(`
                {let i 42}
                {for (i 0) (< i 1) (+ i 1) }
                i                                      `), 42);
    });

});
