"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('cycle for', function () {

    describe('for', function () {
        it('{for (i 0) (< i 3) (+ i 1) i} → 2', function () {
            assert.strictEqual(easl.evaluate(`  
              {let m 0}
              {for (i m) (< i 3) (+ i 1)
                  {set! m i} }
               m
                `), 2);
        });

        it('{for (i 10) (<= i (* 5 20)) (+ i 5) i} → 100', function () {
            assert.strictEqual(easl.evaluate(`
                {let m 0}
                {for (i 10) (<= i (* 5 20)) (+ i 5)
                    {set! m i} }
                m                                      `), 100);
        });
    });
});
