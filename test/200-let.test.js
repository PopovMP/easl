"use strict";

const assert = require("assert");
const {describe, it} = require("@popovmp/mocha-tiny");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('let', function () {

    describe('let with numbers', function () {
        it('{let a} → Error', function () {
            assert.strictEqual(easl.evaluate(`    {let a}     `), "Error: 'let' requires a symbol and a value.");
        });
        it('{let a 2} → undefined', function () {
            assert.strictEqual(easl.evaluate(`    {let a 2}   `), undefined);
        });
        it('{let a 2} a → 2', function () {
            assert.strictEqual(easl.evaluate(`    {let a 2} a `), 2);
        });
        it('{let a 2} {let b 3} a → 2', function () {
            assert.strictEqual(easl.evaluate(`    {let a 2} {let b 3} a  `), 2);
        });
        it('{let a 2} {let b 3} b → 3', function () {
            assert.strictEqual(easl.evaluate(`    {let a 2} {let b 3} 3  `), 3);
        });
        it('{let a 2} {let b (* a 2)} b → 4', function () {
            assert.strictEqual(easl.evaluate(`    {let a 2} {let b (* a 2)} b  `), 4);
        });
        it('{let m 2} ({lambda (a) (* m a)}  2) → 4', function () {
            assert.strictEqual(easl.evaluate(`    {let m 2} ({lambda (a) (* m a)}  2) `), 4);
        });
        it('{let} → error', function () {
            assert.strictEqual(easl.evaluate(`    {let}     `),
                "Error: 'let' requires a symbol and a value.");
        });
    });


    describe('let with strings', function () {
        it('(let name "John") name → "John"', function () {
            assert.strictEqual(easl.evaluate(`   (let name "John") name `), "John");
        });

        it('two strings', function () {
            assert.strictEqual(easl.evaluate(`   
             
             (let first-name  "John ")
             (let second-name "Smith")
               
             (let full-name (~ first-name second-name))
             
             full-name                                      `), "John Smith");
        });
    });

    describe('let with lists', function () {
        it("{let lst '(1 2 3)} lst  → [1, 2, 3]", function () {
            assert.deepStrictEqual(easl.evaluate(`
                {let lst '(1 2 3)} lst `), [1, 2, 3]);
        });

        it('two lists', function () {
            assert.deepStrictEqual(easl.evaluate(`   
                (let lst1 '(1 2))
                (let lst2 '(3 4)) 
                (let new-list (list-concat lst1 lst2))
                new-list                                     `), [1, 2, 3, 4]);
        });
    });

    describe('let lambda', function () {
        it('no arguments', function () {
            assert.strictEqual(easl.evaluate(` 
                    (let answer (lambda () 42))
                    (answer)                                `), 42);
        });

        it('one argument', function () {
            assert.strictEqual(easl.evaluate(` 
                    {let double {lambda (a) (* 2 a)}}
                    (double 2)                              `), 4);
        });
        it('two arguments', function () {
            assert.strictEqual(easl.evaluate(`    
                    {let sum {lambda (a b) (+ a b)}}
                    (sum 2 3)                               `), 5);
        });
        it('let does not return the lambda', function () {
            assert.strictEqual(easl.evaluate(`    
                    ((let sum (lambda (a b) (+ a b))) 2 3)  `),
                "Error: Improper function application. Given: undefined");
        });

        it('let with lambda with multiple expressions', function () {
            assert.strictEqual(easl.evaluate(`    
                    {let get-list {lambda () {let a 1} {set a 2} a}}
                    (get-list)                               `), 2);
        });
    });

    describe('let with function', function () {
        it('no arguments', function () {
            assert.strictEqual(easl.evaluate(` 
                    (let answer () 42)
                    (answer)                                `), 42);
        });

        it('one argument', function () {
            assert.strictEqual(easl.evaluate(` 
                    (let double (a) (* 2 a))
                    (double 2)                              `), 4);
        });

        it('two arguments', function () {
            assert.strictEqual(easl.evaluate(`    
                    (let sum (a b) (+ a b))
                    (sum 2 3)                               `), 5);
        });

        it('let does not return the proc', function () {
            assert.strictEqual(easl.evaluate(`    
                    ((let sum (a b) (+ a b)) 2 3)  `),
                'Error: Improper function application. Given: undefined');
        });

        it('let with proc with multiple expressions', function () {
            assert.strictEqual(easl.evaluate(`    
                    (let get-two () (let a 1) (set a 2) a)
                    (get-two)                               `), 2);
        });
    });
});
