"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('EASL design', function () {

    describe('numbers', function () {
        it('number 1', function () {
            assert.strictEqual(easl.evaluate(`  42  `), 42);
        });
        it('number 2', function () {
            assert.strictEqual(easl.evaluate(`  3.14  `), 3.14);
        });
        it('number 3', function () {
            assert.strictEqual(easl.evaluate(`  1-000-000  `), 1000000);
        });
    });

    describe('boolean', function () {
        it('truthy 1: true', function () {
            assert.strictEqual(easl.evaluate(`(if true 1 0)`), 1);
        });
        it('truthy 2: non empty string', function () {
            assert.strictEqual(easl.evaluate(`(if "hello" 1 0)`), 1);
        });
        it('truthy 3: number different than 0', function () {
            assert.strictEqual(easl.evaluate(`(if 500 1 0)`), 1);
        });
        it('truthy 4: non empty list', function () {
            assert.strictEqual(easl.evaluate(`(if [1 2 3] 1 0)`), 1);
        });

        it('falsy 1: false', function () {
            assert.strictEqual(easl.evaluate(`(if false 1 0)`), 0);
        });
        it('falsy 2: empty string', function () {
            assert.strictEqual(easl.evaluate(`(if "" 1 0)`), 0);
        });
        it('falsy 3: 0', function () {
            assert.strictEqual(easl.evaluate(`(if 0 1 0)`), 0);
        });
        it('falsy 4: empty list', function () {
            assert.strictEqual(easl.evaluate(`(if [] 1 0)`), 0);
        });
        it('falsy 5: null', function () {
            assert.strictEqual(easl.evaluate(`(if null 1 0)`), 0);
        });
    });

    describe('string', function () {
        it('empty', function () {
            assert.strictEqual(easl.evaluate(`  ""  `), "");
        });
        it('non empty', function () {
            assert.strictEqual(easl.evaluate(`  "a"  `), "a");
        });
        it('multiline', function () {
            assert.strictEqual(easl.evaluate(` "
a
b"                                                   `), "\na\nb");
        });
        it('quotation marks', function () {
            assert.strictEqual(easl.evaluate(` "a ""b"" c" `), "a \"b\" c");
        });
        it('quotation marks escape', function () {
            assert.strictEqual(easl.evaluate(` "a \\"b\\" c" `), "a \"b\" c");
        });
    });

    describe('variable definition', function () {
        it('number', function () {
            assert.strictEqual(easl.evaluate(`      {let answer 42}
                                                    answer                  `), 42);
        });
        it('string', function () {
            assert.strictEqual(easl.evaluate(`      {let name "John"}
                                                    name                    `), "John");
        });
        it('boolean', function () {
            assert.strictEqual(easl.evaluate(`      {let is-good true}
                                                    is-good                 `), true);
        });
        it('list', function () {
            assert.deepStrictEqual(easl.evaluate(`  {let lst [1 2 3]}
                                                    lst                     `), [1, 2, 3]);
        });
        it('from calculation', function () {
            assert.strictEqual(easl.evaluate(`      {let num (+ 2 3)}
                                                    num                     `), 5);
        });
        it('from function call', function () {
            assert.strictEqual(easl.evaluate(`      {let len (list.length [4 5 6])}
                                                    len                     `), 3);
        });
        it('cannot define variable twice', function () {
            assert.strictEqual(easl.evaluate(`      {let a 1}
                                                    {let a 2}               `), "Error: Identifier already defined: a");
        });
    });
});
