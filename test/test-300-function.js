"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('function', function () {

    describe('basic application', function () {
        it('no arguments', function () {
            assert.strictEqual(easl.evaluate(` 
                {function f (5)}
                (f)                                 `), 5);
        });

        it('empty arguments', function () {
            assert.strictEqual(easl.evaluate(` 
                {function f () (5)}
                (f)                                 `), 5);
        });

        it('return from env 1', function () {
            assert.strictEqual(easl.evaluate(` 
                {let a 5)
                {function f (a)}
                (f)                                 `), 5);
        });

        it('return from env 2', function () {
            assert.strictEqual(easl.evaluate(` 
                {function f (a)}
                {let a 5)
                (f)                                 `), 5);
        });

        it('identity', function () {
            assert.strictEqual(easl.evaluate(`
                {function identity (x) (x)}
                (identity 5)                         `), 5);
        });

        it('two arguments', function () {
            assert.strictEqual(easl.evaluate(`
                {function sum (a b) (+ a b)}
                (sum 2 3)                            `), 5);
        });

        it('two expressions', function () {
            assert.strictEqual(easl.evaluate(`
                {function sum (a b)
                    {let s (+ a b)}
                    s}
                (sum 2 3)                            `), 5);
        });
    });

    describe('nested functions', function () {
        it('make identity', function () {
            assert.strictEqual(easl.evaluate(` 

        {function make-identity ()
            {lambda (a) (a)}}
    
        (let identity (make-identity))
    
        (identity 5)
                                                 `), 5);
        });
    });

    describe('recursion', function () {
        it('fibonacci tail optimized', function () {
            assert.strictEqual(easl.evaluate(` 

        {function fibo (n)
            {function loop (i prev cur)
                {if (= i n)
                    cur
                    (loop (+ i 1) cur (+ prev cur)) }}

            {cond
                ((= n 1) 1)
                ((= n 2) 1)
                (else (loop 2 1 1)) }}

        (fibo 10)    
                                                 `), 55);
        });
    });

    describe('lambda argument', function () {
        it('calc', function () {
            assert.strictEqual(easl.evaluate(` 
            
        {function calc (operation a b)
            (operation a b)}
    
        (calc {lambda (a b) (+ a b)} 2 3)
                                                 `), 5);
        });
    });
});
