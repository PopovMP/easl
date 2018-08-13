"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('cycle for', function () {

    describe('for', function () {
        it('{for (i 0) (< i 3) (+ i 1) i} → 2', function () {
            assert.strictEqual(easl.evaluate(`    {for (i 0) (< i 3) (+ i 1) i} `), 2);
        });

        it('{for (i 0) (<= i 100) (+ i 1) i} → 100', function () {
            assert.strictEqual(easl.evaluate(`    {for (i 0) (<= i 100) (+ i 1)
                                                      (* 5 i)
                                                      (/ i 5)
                                                      i}                    `), 100);
        });
        it('{for (i 10) (<= i (* 5 20)) (+ i 5) i} → 100', function () {
            assert.strictEqual(easl.evaluate(`    {for (i 10) (<= i (* 5 20)) (+ i 5)
                                                      i}                    `), 100);
        });
    });
});
