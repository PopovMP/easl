"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe("List declaration", function () {
    it("empty list: [] → []", function () {
        assert.deepStrictEqual(easl.evaluate("[]"), []);
    });

    it("empty list: (list) → []", function () {
        assert.deepStrictEqual(easl.evaluate("(list)"), []);
    });

    it("non empty num list: (list 1 2 3)", function () {
        assert.deepStrictEqual(easl.evaluate("(list 1 2 3)"), [1, 2, 3]);
    });

    it('non empty string list: (list "1" "2" "3")', function () {
        assert.deepStrictEqual(easl.evaluate(` (list "1" "2" "3") `), ["1", "2", "3"]);
    });

    it("non empty list: [1 2 3] → [1 2 3]", function () {
        assert.deepStrictEqual(easl.evaluate("[1 2 3]"), [1, 2, 3]);
    });

    it("non empty list with string expr", function () {
        assert.deepStrictEqual(easl.evaluate(`["a" (+ "a" "b") "b"]`), ["a", "ab", "b"]);
    });
});
