"use strict";

const {describe, it} = require("mocha");
const assert = require("assert");
const Easl   = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("list destructuring", function () {
    it("one param, one arg", function () {
        assert.strictEqual(easl.evaluate(` 
                (let (a) (list 3))
                a                   `), 3);
    });

    it("one param, two args", function () {
        assert.strictEqual(easl.evaluate(` 
                (let (a) (list 3 4))
                a                   `), 3);
    });

    it("two params, two args, get first", function () {
        assert.strictEqual(easl.evaluate(` 
                (let (a b) (list 3 4))
                a                  `), 3);
    });

    it("two params, two args, get second", function () {
        assert.strictEqual(easl.evaluate(` 
                (let (a b) (list 3 4))
                b                  `), 4);
    });
});

describe("default parameters", function () {
    it("one param, zero args", function () {
        assert.strictEqual(easl.evaluate(` 
                (let (a) (list))
                a                   `), "Error: cannot set unspecified value to parameter: a.");
    });

    it("default first param", function () {
        assert.strictEqual(easl.evaluate(` 
                (let ( (a 5) ) (list))
                a                   `), 5);
    });

    it("default second param", function () {
        assert.strictEqual(easl.evaluate(` 
                (let ( a (b 5) ) (list 3))
                b                   `), 5);
    });
});

describe("rest parameters", function () {
    it("(... rest) '()", function () {
        assert.deepStrictEqual(easl.evaluate(` 
                (let (. rest) '())
                rest                   `), []);
    });

    it("(a ... rest) '(1 2 3 4)", function () {
        assert.deepStrictEqual(easl.evaluate(` 
                (let (a . rest) '(1 2 3 4))
                rest                   `), [2, 3, 4]);
    });
});


describe("function with default params", function () {
    it("default and rest", function () {
        assert.deepStrictEqual(easl.evaluate(` 
                ( (λ (a (b 7) . c)
                    (list a b c) )
                  1 2 3 4 )                `), [1, 2, [3, 4]]);
    });
});
