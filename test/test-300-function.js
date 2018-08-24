"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('function', function () {

    describe('basic application', function () {
        it('no args, returns constant', function () {
            assert.strictEqual(easl.evaluate(` 
                {function f () 5}
                (f)                                 `), 5);
        });

        it('return val from env defined before the definition', function () {
            assert.strictEqual(easl.evaluate(` 
                {let a 5)
                {function f () a}
                (f)                                 `), 5);
        });

        it('return val from env defined after the definition', function () {
            assert.strictEqual(easl.evaluate(` 
                {function f () a}
                {let a 5)
                (f)                                 `), 5);
        });

        it('identity 1', function () {
            assert.strictEqual(easl.evaluate(`
                {function identity (a) a}
                (identity 5)                         `), 5);
        });

        it('identity 2', function () {
            assert.strictEqual(easl.evaluate(`
                {function identity a a}
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
                {function make-identity () {lambda a a}}
                (let identity (make-identity))
                (identity 5)
                                                 `), 5);
        });
    });

    describe('function calls function', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` 
                {function foo () 5}
                (function bar () (foo))
                (bar)                            `), 5);
        });
    });

    describe('function calls function', function () {
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` 
                {function foo a a}
                (function bar a (foo a))
                (bar 5)                           `), 5);
        });
    });

    describe('recursion', function () {
        it('fibonacci tail optimized', function () {
            assert.strictEqual(easl.evaluate(` 
                {function fibo n
                    {function loop (i prev cur)
                        {if (= i n)
                            cur
                            (loop (+ i 1) cur (+ prev cur)) }}
        
                    {cond
                        ((= n 1) 1)
                        ((= n 2) 1)
                        (else (loop 2 1 1)) }}
        
                (fibo 10)                                `), 55);
        });
    });

    describe('given a lambda as arg with other args', function () {
        it('calc', function () {
            assert.strictEqual(easl.evaluate(` 
                {function apply (f a b) (f a b)}
                (apply {lambda (a b) (+ a b)} 2 3)       `), 5);
        });
    });

    describe('given a lambda as arg with one arg 1', function () {
        it('calc', function () {
            assert.strictEqual(easl.evaluate(` 
                {function apply (f a) (f a)}
                (apply {lambda (a) (* 2 a)}  2)          `), 4);
        });
    });

    describe('given a lambda as arg with one arg 2', function () {
        it('calc', function () {
            assert.strictEqual(easl.evaluate(` 
                {function apply (f a) (f a)}
                (apply {lambda a (* 2 a)}  2)            `), 4);
        });
    });

    describe('given a let lambda as arg with other args', function () {
        it('calc', function () {
            assert.strictEqual(easl.evaluate(` 
                {function apply (f a b) (f a b)}
                {let sum {lambda (a b) (+ a b)}}
                (apply sum 2 3)                          `), 5);
        });
    });

    describe('given a let lambda as arg with one arg 1', function () {
        it('calc', function () {
            assert.strictEqual(easl.evaluate(` 
                {function apply (f a) (f a)}
                {let double {lambda (a) (* 2 a)}}
                (apply double  2)                       `), 4);
        });
    });

    describe('given a let lambda as arg with one arg 2', function () {
        it('calc', function () {
            assert.strictEqual(easl.evaluate(` 
                {function apply (f a) (f a)}
                {let double {lambda a (* 2 a)}}
                (apply double 2)                         `), 4);
        });
    });

    describe('given a function as arg with other args', function () {
        it('calc', function () {
            assert.strictEqual(easl.evaluate(` 
                {function apply (f a b) (f a b)}
                (function sum (a b) (+ a b)}
                (apply sum 2 3)                          `), 5);
        });
    });

    describe('given a function as arg with one arg 1', function () {
        it('calc', function () {
            assert.strictEqual(easl.evaluate(` 
                {function apply (f a) (f a)}
                (function double (a) (* 2 a)}
                (apply double 2)                         `), 4);
        });
    });

    describe('given a function as arg with one arg 2', function () {
        it('calc', function () {
            assert.strictEqual(easl.evaluate(` 
                {function apply (f a) (f a)}
                (function double a (* a 2)}
                (apply double 2)                         `), 4);
        });
    });

});
