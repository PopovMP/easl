"use strict";

const assert = require("assert");
const {describe, it} = require("@popovmp/mocha-tiny");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("Validate application", function () {

    it("() -> error", function () {
        assert.strictEqual(easl.evaluate(` 
                ()              `), "Error: Improper function application. Probably: ()");
    });

    it("((list)) -> error", function () {
        assert.strictEqual(easl.evaluate(` 
                ((list))              `), "Error: Improper function application. Given: ()");
    });

    it("((list 1)) -> error", function () {
        assert.strictEqual(easl.evaluate(` 
                ((list 1) )              `), "Error: Improper function application. Given: (1)");
    });

    it("((list 'a)) -> error", function () {
        assert.strictEqual(easl.evaluate(` 
                ((list 'a) )              `), "Error: Improper function application. Given: (a)");
    });

    it("((list + 1)) -> error", function () {
        assert.strictEqual(easl.evaluate(` 
                ((list + 1) )              `), "Error: Improper function application. Given: (+ 1)");
    });
});
