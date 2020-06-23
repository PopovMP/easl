"use strict";

const assert         = require("assert");
const {describe, it} = require("mocha");
const Easl           = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("yield", function () {
    it("yield out of collect", function () {
        assert.strictEqual(easl.evaluate(` (yield 2) `),
            "Error: 'yield' used out of 'collect'.");
    });

    it("yield with zero expressions", function () {
        assert.strictEqual(easl.evaluate(` (collect (yield)) `),
            "Error: 'yield' requires 1 argument. Given: 0 arguments");
    });

    it("yield with two expressions", function () {
        assert.strictEqual(easl.evaluate(` (collect (yield 3 4)) `),
            "Error: 'yield' requires 1 argument. Given: 2 arguments");
    });
});


describe("collect", function () {
    it("collect with zero expressions", function () {
        assert.strictEqual(easl.evaluate(` (collect) `),
            "Error: 'collect' requires at least 1 expression.");
    });

    it("collect with no yields", function () {
        assert.deepStrictEqual(easl.evaluate(` (collect 3) `), []);
    });

    it("collect with one yield", function () {
        assert.deepStrictEqual(easl.evaluate(` (collect (yield 3)) `), [3]);
    });

    it("collect with two yields", function () {
        assert.deepStrictEqual(easl.evaluate(` (collect (yield 3) (yield 4)) `), [3, 4]);
    });
});
