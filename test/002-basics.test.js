"use strict";

const assert = require("assert");
const {describe, it} = require("@popovmp/mocha-tiny");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("Eval basics", function () {
    describe("Built in constants", function () {
        it("digits: 1 → 1", function () {
            assert.strictEqual(easl.evaluate("1"), 1);
        });
        it("null: null → null", function () {
            assert.strictEqual(easl.evaluate("null"), null);
        });
        it("boolean: true → true", function () {
            assert.strictEqual(easl.evaluate("true"), true);
        });
        it("boolean: false → false", function () {
            assert.strictEqual(easl.evaluate("false"), false);
        });
        it('string: "John" → "John"', function () {
            assert.strictEqual(easl.evaluate('"John"'), "John");
        });
    });

    describe("String constructor", function () {
        it('empty string: (string) → ""', function () {
            assert.strictEqual(easl.evaluate("(string)"), "");
        });
        it('one string: (string Hello) → "Hello"', function () {
            assert.strictEqual(easl.evaluate("(string Hello)"), "Hello");
        });
    });

    describe("Number operators", function () {
        it("add: (+ 1 2) → 3", function () {
            assert.strictEqual(easl.evaluate("(+ 1 2)"), 3);
        });
        it("add: (+ (+ 1 2) 3) → 6", function () {
            assert.strictEqual(easl.evaluate("(+ (+ 1 2) 3)"), 6);
        });
        it("subtract: (- 3 1) → 2", function () {
            assert.strictEqual(easl.evaluate("(- 3 1)"), 2);
        });
        it("subtract: (- (+ 3 2) 1) → 4", function () {
            assert.strictEqual(easl.evaluate("(- (+ 3 2) 1)"), 4);
        });
        it("modulo: (% 13 2) → 1", function () {
            assert.strictEqual(easl.evaluate("(% 13 2)"), 1);
        });
        it("modulo: (% 14 2) → 0", function () {
            assert.strictEqual(easl.evaluate("(% 14 2)"), 0);
        });
    });

    describe("Eval multiple expressions", function () {
        it("1 2 → 2", function () {
            assert.strictEqual(easl.evaluate("1 2"), 2);
        });
        it("3 (+ 1 1) → 2", function () {
            assert.strictEqual(easl.evaluate("3 (+ 1 1)"), 2);
        });
    });

    describe("defined", function () {
        it("defined true", function () {
            assert.strictEqual( easl.evaluate("(let a 1) (defined 'a)"), true);
        });
        it("defined false", function () {
            assert.strictEqual( easl.evaluate("(let a 1) (defined 'b)"), false);
        });
        it("defined with string", function () {
            assert.strictEqual( easl.evaluate('(let a 1) (defined "a")'), true);
        });
        it("defined symbol", function () {
            assert.strictEqual( easl.evaluate("(let a 1) (defined a)"), true);
        });
    });

    describe("value-of symbol", function () {
        it("value-of existing symbol", function () {
            assert.strictEqual( easl.evaluate("(let a 1) (value-of 'a)"), 1);
        });
        it("value-of non-existing symbol", function () {
            assert.strictEqual( easl.evaluate("(let a 1) (value-of 'b)"),
                "Error: Unbound identifier: b");
        });
        it("value-of build-in function", function () {
            assert.strictEqual( easl.evaluate("((value-of '+) 1 2)"), 3);
        });
        it("value-of with string", function () {
            assert.strictEqual( easl.evaluate('(let a 1) (value-of "a")'), 1);
        });
        it("value-of symbol", function () {
            assert.strictEqual( easl.evaluate("(let a 1) (value-of a)"),
                "Error: 'value-of' requires string. Given: number 1");
        });
    });
});
