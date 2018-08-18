"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('function', function () {

    describe('basic application', function () {
        it('no args, returns constant', function () {
            assert.strictEqual(easl.evaluate(` 
                {function f () (5)}
                (f)                                 `), 5);
        });

        it('return val from env defined before the definition', function () {
            assert.strictEqual(easl.evaluate(` 
                {let a 5)
                {function f () (a)}
                (f)                                 `), 5);
        });

        it('return val from env defined after the definition', function () {
            assert.strictEqual(easl.evaluate(` 
                {function f () (a)}
                {let a 5)
                (f)                                 `), 5);
        });

        it('call with one arg', function () {
            assert.strictEqual(easl.evaluate(`
                {function identity (x) (x)}
                (identity 5)                         `), 5);
        });

        it('call with two args', function () {
            assert.strictEqual(easl.evaluate(`
                {function sum (a b) (+ a b)}
                (sum 2 3)                            `), 5);
        });

        it('sets uninitialized args to null', function () {
            assert.strictEqual(easl.evaluate(`
                {function fun (a b) b}
                (fun 1)                             `,), null);
        });

        it('function defines "func-name"', function () {
            assert.strictEqual(easl.evaluate(`
                {function fun (a b) func-name}
                (fun 1 2 3 4)                        `), "fun");
        });

        it('function defines "func-params"', function () {
            assert.deepStrictEqual(easl.evaluate(`
                {function fun (a b) func-params}
                (fun 1 2 3 4)                        `), [ 'a', 'b' ]);
        });

        it('function defines "func-args"', function () {
            assert.deepStrictEqual(easl.evaluate(`
                {function fun (a b) func-args}
                (fun 1 2 3 4)                        `), [ 1, 2, 3, 4 ]);
        });

        it('multiple expressions in body, evaluates all, returns the last value', function () {
            assert.strictEqual(easl.evaluate(`
                {function sum-plus-one (a b)
                    {let s (+ a b)}
                    (+ s 1)}
                (sum-plus-one 2 2)                   `), 5);
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

    describe('given a lambda as arg with other args', function () {
        it('calc', function () {
            assert.strictEqual(easl.evaluate(` 
            
        {function calc (operation a b)
            (operation a b)}
    
        (calc {lambda (a b) (+ a b)} 2 3)
                                                 `), 5);
        });
    });
});
