"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('when', function () {

    it('{when true} → "Error: Empty when block"', function () {
        assert.strictEqual(easl.evaluate("{when true}"), "Error: Empty 'when' block");
    });

    it('(when true 1) → undefined', function () {
        assert.strictEqual(easl.evaluate("(when true 1)"), undefined);
    });

    it('(when true 1 2) → undefined', function () {
        assert.strictEqual(easl.evaluate("(when true 1 2)"), undefined);
    });

    it('nested when', function () {
        assert.strictEqual(easl.evaluate(`
            (let res 0)
            (when true
                (when true
                    (when true
                        (let a 5)
                        (let b 6)
                        (set res (+ a b)))))
            res                     `), 11);
    });
});
