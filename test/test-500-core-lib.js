"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('core-lib', function () {
    describe('+', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (+) `), 0);
        });
        it('one number', function () {
            assert.strictEqual(easl.evaluate(` (+ 5) `),5);
        });
        it('one string', function () {
            assert.strictEqual(easl.evaluate(` (+ "a") `), "a");
        });
        it('two numbers', function () {
            assert.strictEqual(easl.evaluate(` (+ 2 3) `), 5);
        });
        it('three numbers', function () {
            assert.strictEqual(easl.evaluate(` (+ 1 2 3) `), 6);
        });
        it('number + string', function () {
            assert.strictEqual(easl.evaluate(` (+ 1 "a") `), "Error: Wrong parameter types: +");
        });
        it('string + number', function () {
            assert.strictEqual(easl.evaluate(` (+ "a" 1) `), "a1");
        });
    });

    describe('-', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (-) `), "Error: Wrong number of arguments: -");
        });
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` (- 5) `), -5);
        });
        it('one negative arg', function () {
            assert.strictEqual(easl.evaluate(` (- -5) `), 5);
        });
        it('two args', function () {
            assert.strictEqual(easl.evaluate(` (- 8 3) `), 5);
        });
        it('three args', function () {
            assert.strictEqual(easl.evaluate(` (- 8 3 2) `), "Error: Wrong number of arguments: -");
        });
    });

    describe('*', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (*)     `), 0);
        });
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` (* 5)   `), 5);
        });
        it('two args', function () {
            assert.strictEqual(easl.evaluate(` (* 2 3) `), 6);
        });
        it('three args', function () {
            assert.strictEqual(easl.evaluate(` (* 2 3 4) `), 24);
        });
    });

    describe('/', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (/)     `), "Error: Wrong number of arguments: /");
        });
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` (/ 5)   `), "Error: Wrong number of arguments: /");
        });
        it('divide by zero', function () {
            assert.strictEqual(easl.evaluate(` (/ 5 0) `), "Error: Division by zero");
        });
        it('correct division', function () {
            assert.strictEqual(easl.evaluate(` (/ 9 3) `), 3);
        });
    });

    describe('%', function () {
        it('positive numb', function () {
            assert.strictEqual(easl.evaluate(` (% 10 3) `), 1);
        });
        it('negative numb', function () {
            assert.strictEqual(easl.evaluate(` (% -10.0 3) `), -1);
        });
        it('both args negative', function () {
            assert.strictEqual(easl.evaluate(` (% -10.0 -3) `), -1);
        });
    });

    describe('=', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (=) `), "Error: Wrong number of arguments: =");
        });
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` (= 5) `), "Error: Wrong number of arguments: =");
        });
        it('two different args', function () {
            assert.strictEqual(easl.evaluate(` (= 2 3) `), false);
        });
        it('two equal args', function () {
            assert.strictEqual(easl.evaluate(` (= 3 3) `), true);
        });
        it('three equal args', function () {
            assert.strictEqual(easl.evaluate(` (= 3 3 3) `), true);
        });
        it('three equal expr', function () {
            assert.strictEqual(easl.evaluate(` (= (+ 1 2) (/ 9 3) (* 1 3)) `), true);
        });
        it('four equal expr', function () {
            assert.strictEqual(easl.evaluate(` (= (+ 1 2) (/ 9 3) (* 1 3) 3) `), true);
        });
    });

    describe('and', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (and) `), true);
        });
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` (and 5) `), 5);
        });
        it('two truthy args', function () {
            assert.strictEqual(easl.evaluate(` (and 2 3) `), 3);
        });
        it("two args", function () {
            assert.strictEqual(easl.evaluate(` (and true 0) `), 0);
        });
        it('three truthy args', function () {
            assert.strictEqual(easl.evaluate(` (and 3 0 3) `), 0);
        });
        it('three truthy expr', function () {
            assert.strictEqual(easl.evaluate(` (and (+ 1 2) (/ 9 3) (+ 3 3)) `), 6);
        });
        it('four expr', function () {
            assert.strictEqual(easl.evaluate(` (and (+ 1 2) (/ 9 3) (- 3 3) true) `), 0);
        });
    });

    describe('or', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (or) `), false);
        });
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` (or 5) `), 5);
        });
        it('two truthy args', function () {
            assert.strictEqual(easl.evaluate(` (or 2 3) `), 2);
        });
        it("two args", function () {
            assert.strictEqual(easl.evaluate(` (or true 0) `), true);
        });
        it('three truthy args', function () {
            assert.strictEqual(easl.evaluate(` (or 3 0 3) `), 3);
        });
        it('three truthy expr', function () {
            assert.strictEqual(easl.evaluate(` (or (+ 1 2) (/ 9 3) (+ 3 3)) `), 3);
        });
        it('four expr', function () {
            assert.strictEqual(easl.evaluate(` (or (- 5 5) (/ 9 3) (- 3 3) true) `), 3);
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
             (type-of a)                             `), "number");
        });

        it('type-of function', function () {
            assert.strictEqual(easl.evaluate(` 
             {function sum (a b) (+ a b)}
             (type-of sum)                           `), "function");
        });

        it('type-of let lambda', function () {
            assert.strictEqual(easl.evaluate(` 
             {let sum {lambda (a b) (+ a b)} }
             (type-of sum)                           `), "function");
        });

        it('type-of lambda', function () {
            assert.strictEqual(easl.evaluate(` 
             (type-of {lambda (a b) (+ a b)})        `), "function");
        });

        it('using the string "string"', function () {
            assert.strictEqual(easl.evaluate(` 
            (str.length "string")      `), 6);
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
            assert.strictEqual(easl.evaluate(`   (to-string [])        `), "()");
        });
        it('non empty list strings', function () {
            assert.strictEqual(easl.evaluate(`   (to-string [1 2 3 4 5])  `),
                "(1 2 3 4 5)");
        });
        it('lambda', function () {
            assert.strictEqual(easl.evaluate(`   (to-string {lambda (a b) (+ a b)} )  `),
                "(lambda (a b) (+ a b))");
        });
        it('function', function () {
            assert.strictEqual(easl.evaluate(` 
              {function sum (a b) (+ a b)}
              (to-string sum)  `), "(lambda (a b) (+ a b))");
        });
        it('function two expressions', function () {
            assert.strictEqual(easl.evaluate(` 
              {function sum (a) {let b 1} (+ a b)}
              (to-string sum)  `), "(lambda (a) (block (let b 1) (+ a b)))");
        });
    });

    describe('to-number', function () {
        it('number', function () {
            assert.strictEqual(easl.evaluate(`   (to-number 42)        `), 42);
        });
        it('string', function () {
            assert.strictEqual(easl.evaluate(`   (to-number "42")      `), 42);
        });
        it('element of string list', function () {
            assert.strictEqual(easl.evaluate(`
               {let lst ["42"]}
               {let elm (list.get lst 0)}
               (to-number elm)                                          `), 42);
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
        it('non empty list', function () {
            assert.strictEqual(easl.evaluate(`   (to-number [1 2 3])   `), null);
        });
        it('not a number', function () {
            assert.strictEqual(easl.evaluate(`   (to-number "hello")   `), null);
        });
    });
});
