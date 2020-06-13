"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('numb-lib', function () {
    it('(numb-max-int)', function () {
        assert.strictEqual(easl.evaluate(` (numb-max-int) `), Number.MAX_SAFE_INTEGER);
    });
    it('(numb-max-int 42) -> Error', function () {
        assert.strictEqual(easl.evaluate(` (numb-max-int 42) `),
            "Error: 'numb-max-int' requires 0 arguments. Given: 1 argument");
    });


    it('(numb-parse-int "42") -> 42', function () {
        assert.strictEqual(easl.evaluate(` (numb-parse-int "42") `), 42);
    });
    it('(numb-parse-int "3.14") -> 3', function () {
        assert.strictEqual(easl.evaluate(` (numb-parse-int "3.14") `), 3);
    });
    it('(numb-parse-int 42) -> Error', function () {
        assert.strictEqual(easl.evaluate(` (numb-parse-int 42) `),
            "Error: 'numb-parse-int' requires string. Given: number 42");
    });
    it('(numb-parse-int "R42") -> Error', function () {
        assert.strictEqual(easl.evaluate(` (numb-parse-int "R42") `),
            "Error: 'numb-parse-int' argument not a number: R42");
    });

    it('(numb-to-fixed 3.14) -> "3"', function () {
        assert.strictEqual(easl.evaluate(` (numb-to-fixed 3.14) `), "3");
    });
    it('(numb-to-fixed 3.14 1) -> "3.1"', function () {
        assert.strictEqual(easl.evaluate(` (numb-to-fixed 3.14 1) `), "3.1");
    });
    it('(numb-to-fixed 3.14 2) -> "3.14"', function () {
        assert.strictEqual(easl.evaluate(` (numb-to-fixed 3.14 2) `), "3.14");
    });
    it('(numb-to-fixed 3.14 3) -> "3.140"', function () {
        assert.strictEqual(easl.evaluate(` (numb-to-fixed 3.14 3) `), "3.140");
    });
    it('(numb-to-fixed) -> Error', function () {
        assert.strictEqual(easl.evaluate(` (numb-to-fixed) `),
            "Error: 'numb-to-fixed' requires from 1 argument to 2 arguments. Given: 0 arguments");
    });
    it('(numb-to-fixed 3.14 2 3) -> Error', function () {
        assert.strictEqual(easl.evaluate(` (numb-to-fixed 3.14 2 3) `),
            "Error: 'numb-to-fixed' requires from 1 argument to 2 arguments. Given: 3 arguments");
    });
});
