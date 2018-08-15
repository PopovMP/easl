"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('EASL design', function () {

    describe('types', function () {
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
        it('true 1', function () {
            assert.strictEqual(easl.evaluate(`(if true 1 0)`), 1);
        });
        it('true 2', function () {
            assert.strictEqual(easl.evaluate(`(if "hello" 1 0)`), 1);
        });
        it('true 3', function () {
            assert.strictEqual(easl.evaluate(`(if 500 1 0)`), 1);
        });
        it('true 4', function () {
            assert.strictEqual(easl.evaluate(`(if [1 2 3] 1 0)`), 1);
        });

        it('false 1', function () {
            assert.strictEqual(easl.evaluate(`(if false 1 0)`), 0);
        });
        it('false 2', function () {
            assert.strictEqual(easl.evaluate(`(if "" 1 0)`), 0);
        });
        it('false 3', function () {
            assert.strictEqual(easl.evaluate(`(if 0 1 0)`), 0);
        });
        it('false 4', function () {
            assert.strictEqual(easl.evaluate(`(if [] 1 0)`), 0);
        });
    });

    describe('variable definition', function () {
        it('number', function () {
            assert.strictEqual(easl.evaluate(`      {let answer 42}
                                                    answer                  ` ), 42);
        });
        it('string', function () {
            assert.strictEqual(easl.evaluate(`      {let name "John"}
                                                    name                    ` ), "John");
        });
        it('boolean', function () {
            assert.strictEqual(easl.evaluate(`      {let is-good true}
                                                    is-good                 ` ), true);
        });
        it('list', function () {
            assert.deepStrictEqual(easl.evaluate(`  {let lst [1 2 3]}
                                                    lst                     ` ), [1, 2, 3]);
        });
        it('from calculation', function () {
            assert.strictEqual(easl.evaluate(`      {let num (+ 2 3)}
                                                    num                     ` ), 5);
        });
        it('from function call', function () {
            assert.strictEqual(easl.evaluate(`      {let len (list.length [4 5 6])}
                                                    len                     ` ), 3);
        });
    });

    describe('function definition', function () {
        it('function', function () {
            assert.strictEqual(easl.evaluate(`      {function sum (a b) (+ a b)}
                                                    (sum 2 3)               `), 5);
        });
        it('lambda', function () {
            assert.strictEqual(easl.evaluate(`      {let sum {lambda (a b) (+ a b)}}
                                                    (sum 2 3)               `), 5);
        });
    });
});
