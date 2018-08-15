"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('function', function () {

    describe('basic application', function () {
        it('no arguments', function () {
            assert.strictEqual(easl.evaluate(` 
                {function f () (5)}
                (f)                                 `), 5);
        });

        it('return from env 1', function () {
            assert.strictEqual(easl.evaluate(` 
                {let a 5)
                {function f () (a)}
                (f)                                 `), 5);
        });

        it('return from env 2', function () {
            assert.strictEqual(easl.evaluate(` 
                {function f () (a)}
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
            (loop n 2 1 1)}

        {function loop (n i prev cur)
                    {if (= i n)
                        cur
                        (loop n (+ i 1) cur (+ prev cur))}}

        (fibo 10)    
                                                 `), 55);
        });
    });

    describe('closure', function () {
        it('make adder', function () {
            assert.strictEqual(easl.evaluate(` 
            
                {function make-adder (a)
                    {lambda (a b) (+ a b)}}

                {let add2 (make-adder 2)}

                (add2 3)
                                                 `, false), 5);
        });
    });

});
