"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const {Easl, Parser} = require("../public/js/easl.js");

const easl = new Easl();
const parser = new Parser();

describe("quote", function () {
    it("(quote a) -> a", function () {
        assert.strictEqual(easl.evaluate(` (quote a) `), "a");
    });

    it("(quote 1) -> 1", function () {
        assert.strictEqual(easl.evaluate(` (quote 1) `), 1);
    });

    it("{quote (a 1)} -> (a 1)", function () {
        assert.deepStrictEqual(easl.evaluate(` {quote (a 1)} `), ["a", 1]);
    });

    it("{quote [a 1]} -> (list a 1)", function () {
        assert.deepStrictEqual(easl.evaluate(` {quote (list a 1)} `), ["list", "a", 1]);
    });

    it("(quote ((quote (1)) 2)) -> (list a 1)", function () {
        assert.deepStrictEqual(easl.evaluate(` (to-string (quote ((quote (1)) 2)) )`), '((quote (1)) 2)');
    });
});

describe("' quote abbreviation", function () {
    it("'a -> a", function () {
        assert.strictEqual(easl.evaluate(`'a`), "a");
    });

    it(" 'a -> a", function () {
        assert.strictEqual(easl.evaluate(` 'a `), "a");
    });

    it(" ''a -> (quote a)", function () {
        assert.deepStrictEqual(easl.evaluate(` ''a `), ["quote", "a"]);
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

    it(" '(a) -> (a)", function () {
        assert.deepStrictEqual(easl.evaluate(` '(a) `), ["a"]);
    });

    it(" ''(a) -> (a)", function () {
        assert.deepStrictEqual(easl.evaluate(` ''(a) `), ["quote", ["a"]]);
    });

    it(" '(a b 1) -> '(a b 1)", function () {
        assert.deepStrictEqual(easl.evaluate(` '(a b 1) `), ["a", "b", 1]);
    });

    it(" '(a 'b 1) -> '(a 'b 1)", function () {
        assert.deepStrictEqual(easl.evaluate(` '(a 'b 1) `), ["a", ["quote", "b"], 1]);
    });

    it(" '(list a b) -> (a b)", function () {
        assert.deepStrictEqual(easl.evaluate(` '(list a b) `), ["list", "a", "b"]);
    });
});


describe("nested quote abbrev", function () {
    it("'('(1))", function () {
        assert.deepStrictEqual(easl.evaluate(` '('(1)) `), [["quote", [1]]]);
    });

    it("'('(1) 2) text", function () {
        assert.strictEqual(parser.expandQuotedList( parser.tokenize(
            ` '('(1) 2) `) ).join(" "),
            "( quote ( ( quote ( 1 ) ) 2 ) )" );
    });

    it("'('(1 2 3) 2) text", function () {
        assert.strictEqual(parser.expandQuotedList( parser.tokenize(
            ` '('(1 2 3) 2) `) ).join(" "),
            "( quote ( ( quote ( 1 2 3 ) ) 2 ) )" );
    });

    it("'('(1) 2)", function () {
        assert.deepStrictEqual(easl.evaluate(` '('(1) 2) `) ,
            [["quote", [1]], 2] );
    });

    it("'('(1 2 3) 2)", function () {
        assert.deepStrictEqual(easl.evaluate(` '('(1 2 3) 2) `),
            [["quote", [1, 2, 3]], 2] );
    });

    it("'(1 '(2 '(3)) 4)", function () {
        assert.deepStrictEqual(easl.evaluate(` '(1 '(2 '(3)) 4) `), [1, ["quote", [2, ["quote", [3]]]], 4]);
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
            {(1 2) 1} 
            {else (loop 2 1 1)} }} )
        `),
            "(function fibo (n) (function loop (i prev cur) (if (= i n) cur (loop (+ i 1) cur (+ prev cur)))) (case n ((1 2) 1) (else (loop 2 1 1))))");
    });
});
