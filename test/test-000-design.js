"use strict";

const assert = require("assert");
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

    describe('type-of', function () {
        it('type-of number', function () {
            assert.strictEqual(easl.evaluate(`  (type-of 42)       `), "number");
        });
        it('type-of string', function () {
            assert.strictEqual(easl.evaluate(`  (type-of "hello")  `), "string");
        });
        it('type-of boolean', function () {
            assert.strictEqual(easl.evaluate(`  (type-of true)     `), "boolean");
        });
        it('type-of null', function () {
            assert.strictEqual(easl.evaluate(`  (type-of null)     `), "null");
        });
        it('type-of list', function () {
            assert.strictEqual(easl.evaluate(`  (type-of [1 2 3 4])  `), "list");
        });

        it('type-of let expression', function () {
            assert.strictEqual(easl.evaluate(` 
             {let a (+ 3 4) }
             (type-of a)                           `), "number");
        });

        it('type-of function', function () {
            assert.strictEqual(easl.evaluate(` 
             {function sum (a b) {+ a b)}
             (type-of sum)                           `), "function");
        });

        it('type-of let lambda', function () {
            assert.strictEqual(easl.evaluate(` 
             {let sum {lambda (a b) {+ a b)} }
             (type-of sum)                           `), "function");
        });

        it('type-of lambda', function () {
            assert.strictEqual(easl.evaluate(` 
             (type-of {lambda (a b) {+ a b)})        `), "function");
        });
    });

    describe('to-string', function () {
        it('number', function () {
            assert.strictEqual(easl.evaluate(`   (to-string 42)        `), "42");
        });
        it('string', function () {
            assert.strictEqual(easl.evaluate(`   (to-string "42")      `), "42");
        });
        it('true', function () {
            assert.strictEqual(easl.evaluate(`   (to-string true)      `), "true");
        });
        it('false', function () {
            assert.strictEqual(easl.evaluate(`   (to-string false)     `), "false");
        });
        it('null', function () {
            assert.strictEqual(easl.evaluate(`   (to-string null)      `), "null");
        });
        it('empty string', function () {
            assert.strictEqual(easl.evaluate(`   (to-string "")        `), "");
        });
        it('empty list', function () {
            assert.strictEqual(easl.evaluate(`   (to-string [])        `), "");
        });
        it('multiple strings', function () {
            assert.strictEqual(easl.evaluate(`   (to-string "hello" "world")  `), "hello world");
        });
        it('lambda', function () {
            assert.strictEqual(easl.evaluate(`   (to-string {lambda (a b) (+ a b)} )  `), "{lambda (a b) (+ a b)}");
        });
        it('function', function () {
            assert.strictEqual(easl.evaluate(` 
              {function sum (a b) (+ a b)}
              (to-string sum)  `), "{lambda (a b) (+,a,b)}");
        });
        it('function two expressions', function () {
            assert.strictEqual(easl.evaluate(` 
              {function sum (a) {let b 1} (+ a b)}
              (to-string sum)  `), "{lambda (a) (let,b,1 +,a,b)}");
        });
    });

    describe('to-number', function () {
        it('number', function () {
            assert.strictEqual(easl.evaluate(`   (to-number 42)        `), 42);
        });
        it('string', function () {
            assert.strictEqual(easl.evaluate(`   (to-number "42")      `), 42);
        });
        it('true', function () {
            assert.strictEqual(easl.evaluate(`   (to-number true)      `), 1);
        });
        it('false', function () {
            assert.strictEqual(easl.evaluate(`   (to-number false)     `), 0);
        });
        it('null', function () {
            assert.strictEqual(easl.evaluate(`   (to-number null)      `), 0);
        });
        it('empty string', function () {
            assert.strictEqual(easl.evaluate(`   (to-number "")        `), 0);
        });
        it('empty list', function () {
            assert.strictEqual(easl.evaluate(`   (to-number [])        `), 0);
        });
        it('NaN', function () {
            assert.strictEqual(easl.evaluate(`   (to-number "hello")   `), null);
        });
    });
});
