"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('try throw', function () {
    it('throw error', function () {
        assert.strictEqual(easl.evaluate(` "a" {throw "b"} "c"`), "b");
    });

    it('try with one expression in body', function () {
        assert.strictEqual(easl.evaluate(` {try null 5}  `), 5);
    });

    it('try with two expressions in body', function () {
        assert.strictEqual(easl.evaluate(` {try null 3 5}  `), 5);
    });

    it('try with null', function () {
        assert.strictEqual(easl.evaluate(` {try null  {throw "error"} }  `), null);
    });

    it('try with true', function () {
        assert.strictEqual(easl.evaluate(` {try true  {throw "error"} }  `), true);
    });

    it('try with false', function () {
        assert.strictEqual(easl.evaluate(` {try false  {throw "error"} }  `), false);
    });

    it('try with zero', function () {
        assert.strictEqual(easl.evaluate(` {try 0  {throw "error"} }  `), 0);
    });

    it('try with number', function () {
        assert.strictEqual(easl.evaluate(` {try 5  {throw "error"} }  `), 5);
    });

    it('try with expression', function () {
        assert.strictEqual(easl.evaluate(` {try (+ 2 3) {throw "error"} }  `), 5);
    });

    it('try with string', function () {
        assert.strictEqual(easl.evaluate(` {try "what!" {throw "error"} }  `), "what!");
    });

    it('try with lambda', function () {
        assert.strictEqual(easl.evaluate(` {try {lambda (a) a} {throw "error"} }  `), "error");
    });

    it('try with function', function () {
        assert.strictEqual(easl.evaluate(`
            {let catch (e) (+ "Error: " e)}
            {try catch {throw "from throw"} }  `), "Error: from throw");
    });
});
