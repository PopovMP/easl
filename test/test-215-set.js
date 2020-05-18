"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe("set", function () {
    it("set val", function () {
        assert.strictEqual(easl.evaluate(`
            {let a 1}
            {set a 2}
            a                           `), 2);
    });

    it("set lambda", function () {
        assert.strictEqual(easl.evaluate(`
            {let a {lambda () 1 }}
            {set a {lambda () 2 }}
            (a)                         `), 2);
    });

    it("set function to var", function () {
        assert.strictEqual(easl.evaluate(`
            {function foo () 1}
            {set foo 2}
            foo                         `), 2);
    });

    it("set function to function", function () {
        assert.strictEqual(easl.evaluate(`
            {function foo () 1}
            {function bar () (+ 1 2)}
            {set foo bar}
            (foo)                       `), 3);
    });

    it("set returns the value", function () {
        assert.strictEqual(easl.evaluate(`
            {let a 5}
            {set a 6}                 `), 6);
    });

    it("set unbound identifier", function () {
        assert.strictEqual(easl.evaluate(`
            {set a 1}                 `),
            "Error: Unbound identifier: a");
    });

    it("{set} -> error", function () {
        assert.strictEqual(easl.evaluate(`
            {set}                 `),
            "Error: 'set' requires 2 arguments. Given: 0");
    });

    it("{set a} -> error", function () {
        assert.strictEqual(easl.evaluate(`
            {let a 5}
            {set a}                 `),
            "Error: 'set' requires 2 arguments. Given: 1");
    });

    it("{set a 1 2} -> error", function () {
        assert.strictEqual(easl.evaluate(`
            {let a 5}
            {set a 1 2}                 `),
            "Error: 'set' requires 2 arguments. Given: 3");
    });
});
