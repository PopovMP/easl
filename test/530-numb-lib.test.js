"use strict";

const assert = require("assert");
const {describe, it} = require("@popovmp/mocha-tiny");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('number-lib', function () {
    it('(number-max-int)', function () {
        assert.strictEqual(easl.evaluate(` (number-max-int) `), Number.MAX_SAFE_INTEGER);
    });
    it('(number-max-int 42) -> Error', function () {
        assert.strictEqual(easl.evaluate(` (number-max-int 42) `),
            "Error: 'number-max-int' requires 0 arguments. Given: 1 argument");
    });


    it('(number-parse-int "42") -> 42', function () {
        assert.strictEqual(easl.evaluate(` (number-parse-int "42") `), 42);
    });
    it('(number-parse-int "3.14") -> 3', function () {
        assert.strictEqual(easl.evaluate(` (number-parse-int "3.14") `), 3);
    });
    it('(number-parse-int 42) -> Error', function () {
        assert.strictEqual(easl.evaluate(` (number-parse-int 42) `),
            "Error: 'number-parse-int' requires string. Given: number 42");
    });
    it('(number-parse-int "R42") -> Error', function () {
        assert.strictEqual(easl.evaluate(` (number-parse-int "R42") `),
            "Error: 'number-parse-int' argument not a number: R42");
    });

    it('(number-to-fixed 3.14) -> "3"', function () {
        assert.strictEqual(easl.evaluate(` (number-to-fixed 3.14) `), "3");
    });
    it('(number-to-fixed 3.14 1) -> "3.1"', function () {
        assert.strictEqual(easl.evaluate(` (number-to-fixed 3.14 1) `), "3.1");
    });
    it('(number-to-fixed 3.14 2) -> "3.14"', function () {
        assert.strictEqual(easl.evaluate(` (number-to-fixed 3.14 2) `), "3.14");
    });
    it('(number-to-fixed 3.14 3) -> "3.140"', function () {
        assert.strictEqual(easl.evaluate(` (number-to-fixed 3.14 3) `), "3.140");
    });
    it('(number-to-fixed) -> Error', function () {
        assert.strictEqual(easl.evaluate(` (number-to-fixed) `),
            "Error: 'number-to-fixed' requires from 1 argument to 2 arguments. Given: 0 arguments");
    });
    it('(number-to-fixed 3.14 2 3) -> Error', function () {
        assert.strictEqual(easl.evaluate(` (number-to-fixed 3.14 2 3) `),
            "Error: 'number-to-fixed' requires from 1 argument to 2 arguments. Given: 3 arguments");
    });
});
