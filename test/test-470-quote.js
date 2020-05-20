"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("quote", function () {
    it("{quote a} -> a", function () {
        assert.strictEqual(easl.evaluate(` {quote a} `), "a");
    });

    it("{quote 1} -> 1", function () {
        assert.strictEqual(easl.evaluate(` {quote 1} `), 1);
    });

    it("{quote (a 1)} -> (a 1)", function () {
        assert.deepStrictEqual(easl.evaluate(` {quote (a 1)} `), ["a", 1]);
    });

    it("{quote [a 1]} -> (list a 1)", function () {
        assert.deepStrictEqual(easl.evaluate(` {quote (list a 1)} `), ["list", "a", 1]);
    });
});

describe("' quote abbreviation", function () {
    it("'a -> a", function () {
        assert.strictEqual(easl.evaluate(`'a`), "a");
    });

    it(" 'a -> a", function () {
        assert.strictEqual(easl.evaluate(` 'a `), "a");
    });

    it(" (list 'a ) -> (a)", function () {
        assert.deepStrictEqual(easl.evaluate(` (list 'a ) `), ["a"]);
    });

    it(" (list 'a b' ) -> (a b)", function () {
        assert.deepStrictEqual(easl.evaluate(` (list 'a 'b ) `), ["a", "b"]);
    });

    it(" (list 'a) -> (a)", function () {
        assert.deepStrictEqual(easl.evaluate(` (list 'a) `), ["a"]);
    });

    it(" (list 'a b') -> (a b)", function () {
        assert.deepStrictEqual(easl.evaluate(` (list 'a 'b) `), ["a", "b"]);
    });

    it(" '(a b 1) -> '(a b 1)", function () {
        assert.deepStrictEqual(easl.evaluate(` '(a b 1) `), ["a", "b", 1]);
    });

    it(" '(a 'b 1) -> '(a 'b 1)", function () {
        assert.deepStrictEqual(easl.evaluate(` '(a 'b 1) `), ["a", "'b", 1]);
    });

    it(" '(list a b) -> (a b)", function () {
        assert.deepStrictEqual(easl.evaluate(` '(list a b) `), ["list", "a", "b"]);
    });
});

describe("(to-string (quote code))", function () {
    it("fibo", function () {
        assert.strictEqual(easl.evaluate(`
(to-string 
    '{function fibo (n)
        {function loop (i prev cur)
            {if (= i n)
                cur
                (loop (+ i 1) cur (+ prev cur)) }}
        {case n
            {'(1 2) 1} 
            {else (loop 2 1 1)} }} )
        `),
            "(function fibo (n) (function loop (i prev cur) (if (= i n) cur (loop (+ i 1) cur (+ prev cur)))) (case n (' (1 2) 1) (else (loop 2 1 1))))");
    });
});
