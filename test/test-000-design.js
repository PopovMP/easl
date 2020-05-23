"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("EASL design", function () {

    describe("numbers", function () {
        it("42 -> 42", function () {
            assert.strictEqual(easl.evaluate(`  42  `), 42);
        });
        it("3.14 -> 3.14", function () {
            assert.strictEqual(easl.evaluate(`  3.14  `), 3.14);
        });
    });

    describe("boolean truthy", function () {
        it("true", function () {
            assert.strictEqual(easl.evaluate(`(if true 1 0)`), 1);
        });
        it("non empty string", function () {
            assert.strictEqual(easl.evaluate(`(if "hello" 1 0)`), 1);
        });
        it("number different than 0", function () {
            assert.strictEqual(easl.evaluate(`(if 500 1 0)`), 1);
        });
        it("non empty list", function () {
            assert.strictEqual(easl.evaluate(`(if '(1 2 3) 1 0)`), 1);
        });
    });

    describe("boolean false", function () {
        it("false", function () {
            assert.strictEqual(easl.evaluate(`(if false 1 0)`), 0);
        });
        it("empty string", function () {
            assert.strictEqual(easl.evaluate(`(if "" 1 0)`), 0);
        });
        it("number 0", function () {
            assert.strictEqual(easl.evaluate(`(if 0 1 0)`), 0);
        });
        it("empty list", function () {
            assert.strictEqual(easl.evaluate(`(if '() 1 0)`), 0);
        });
        it("null", function () {
            assert.strictEqual(easl.evaluate(`(if null 1 0)`), 0);
        });
    });

    describe("string", function () {
        it("empty", function () {
            assert.strictEqual(easl.evaluate(`  ""  `), "");
        });
        it("non empty", function () {
            assert.strictEqual(easl.evaluate(`  "a"  `), "a");
        });
        it("multiline", function () {
            assert.strictEqual(easl.evaluate(` "
a
b"                                                   `), "\na\nb");
        });
        it("quotation marks", function () {
            assert.strictEqual(easl.evaluate(` "a ""b"" c" `), "a \"b\" c");
        });
        it("quotation marks escape", function () {
            assert.strictEqual(easl.evaluate(` "a \\"b\\" c" `), "a \"b\" c");
        });
    });

    describe("variable definition", function () {
        it("number", function () {
            assert.strictEqual(easl.evaluate(`      (let answer 42)
                                                    answer                  `), 42);
        });
        it("string", function () {
            assert.strictEqual(easl.evaluate(`      (let name "John")
                                                    name                    `), "John");
        });
        it("boolean", function () {
            assert.strictEqual(easl.evaluate(`      (let is-good true)
                                                    is-good                 `), true);
        });
        it("list", function () {
            assert.deepStrictEqual(easl.evaluate(`  (let lst '(1 2 3))
                                                    lst                     `), [1, 2, 3]);
        });
        it("from calculation", function () {
            assert.strictEqual(easl.evaluate(`      (let num (+ 2 3))
                                                    num                     `), 5);
        });
        it("from function call", function () {
            assert.strictEqual(easl.evaluate(`      (let len (list.length '(4 5 6)))
                                                    len                     `), 3);
        });
        it("cannot define variable twice", function () {
            assert.strictEqual(easl.evaluate(`      (let a 1)
                                                    (let a 2)               `),
                                                    "Error: Identifier already defined: a");
        });
    });
});
