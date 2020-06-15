"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("function", function () {

    describe("function definition", function () {
        it("function with an empty body", function () {
            assert.strictEqual(easl.evaluate(`
              (let foo ())
              (foo)                             `),
                "Error: Improper function application. Probably: ()");
        });
        it("function without params 1", function () {
            assert.strictEqual(easl.evaluate(`
              (let foo 5)
              (foo)                             `),
                "Error: Improper function application. Given: 5");
        });
        it("function without params 2", function () {
            assert.strictEqual(easl.evaluate(`
              (let foo (+ 2 3))
              (foo)                             `),
                "Error: Improper function application. Given: 5");
        });
        it("we can define function only once", function () {
            assert.strictEqual(easl.evaluate(`
              {let foo () 1}
              {let foo () 2}               `),
                "Error: Identifier already defined: foo");
        });
    });

    describe("function call", function () {
        it("builtin function", function () {
            assert.strictEqual(easl.evaluate(`  (math-pi)                      `), 3.141592653589793);
        });
        it("user function", function () {
            assert.strictEqual(easl.evaluate(`
              {let double (n)
                (* 2 n) }
              (double 5)                                        `), 10);
        });
        it("lambda", function () {
            assert.strictEqual(easl.evaluate(`
              {let double {lambda (n) (* 2 n)}}
              (double 5)                                        `), 10);
        });
        it("lambda definition and execution", function () {
            assert.strictEqual(easl.evaluate(`  
            ({lambda (n) (* 2 n)} 5)                            `), 10);
        });
        it("not a function", function () {
            assert.strictEqual(easl.evaluate(`  (42)     `),
                "Error: Improper function application. Given: 42");
        });
        it("unknown function", function () {
            assert.strictEqual(easl.evaluate(` (foo 42)  `),
                "Error: Unbound identifier: foo");
        });
    });

    describe("basic application", function () {
        it("no args, returns constant", function () {
            assert.strictEqual(easl.evaluate(` 
                {let f () 5}
                (f)                                 `), 5);
        });

        it("return val from env defined before the definition", function () {
            assert.strictEqual(easl.evaluate(` 
                {let a 5)
                {let f () a}
                (f)                                 `), 5);
        });

        it("return val from env defined after the definition", function () {
            assert.strictEqual(easl.evaluate(` 
                {let f () a}
                {let a 5)
                (f)                                 `), 5);
        });

        it("identity 1", function () {
            assert.strictEqual(easl.evaluate(`
                {let identity (a) a}
                (identity 5)                         `), 5);
        });

        it("identity 2", function () {
            assert.strictEqual(easl.evaluate(`
                {let identity (a) a}
                (identity 5)                         `), 5);
        });

        it("call with two args", function () {
            assert.strictEqual(easl.evaluate(`
                {let sum (a b) (+ a b)}
                (sum 2 3)                            `), 5);
        });

        it("throw on unspecified parameters", function () {
            assert.strictEqual(easl.evaluate(`
                {let fun (a b) b}
                (fun 1)                             `,),
                "Error: cannot set unspecified value to parameter: b.");
        });

        it("function defines `func-args`", function () {
            assert.deepStrictEqual(easl.evaluate(`
                {let fun (a b) #args}
                (fun 1 2 3 4)                        `), [1, 2, 3, 4]);
        });

        it("multiple expressions in body, evaluates all, returns the last value", function () {
            assert.strictEqual(easl.evaluate(`
                {let sum-plus-one (a b)
                    {let s (+ a b)}
                    (+ s 1)}
                (sum-plus-one 2 2)                   `), 5);
        });
    });

    describe("function returns function", function () {
        it("no args", function () {
            assert.strictEqual(easl.evaluate(` 
                {let foo () 5}
                (let bar () (foo))
                (bar)                            `), 5);
        });

        it("make identity", function () {
            assert.strictEqual(easl.evaluate(` 
                {let make-identity () {lambda (a) a}}
                {let identity (make-identity)}
                (identity 5)
                                                 `), 5);
        });
    });

    describe("function calls function", function () {
        it("no args", function () {
            assert.strictEqual(easl.evaluate(` 
                {let foo () 5}
                {let bar () foo}
                ((bar))                            `), 5);
        });
        it("one arg", function () {
            assert.strictEqual(easl.evaluate(` 
                {let foo (a) a}
                {let bar (a) (foo a)}
                (bar 5)                           `), 5);
        });
        it("one arg - 2", function () {
            assert.strictEqual(easl.evaluate(` 
                {let foo (a) a}
                {let bar () foo}
                ((bar) 5)                          `), 5);
        });
    });

    describe("recursion", function () {
        it("fibonacci tail optimized", function () {
            assert.strictEqual(easl.evaluate(` 
                {let fibo (n)
                    {let loop (i prev cur)
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

    describe("given a lambda as arg with other args", function () {
        it("calc", function () {
            assert.strictEqual(easl.evaluate(` 
                {let app (f a b) (f a b)}
                (app {lambda (a b) (+ a b)} 2 3)       `), 5);
        });
    });

    describe("given a lambda as arg with one arg 1", function () {
        it("calc", function () {
            assert.strictEqual(easl.evaluate(` 
                {let app (f a) (f a)}
                (app {lambda (a) (* 2 a)}  2)          `), 4);
        });
    });

    describe("given a lambda as arg with one arg 2", function () {
        it("calc", function () {
            assert.strictEqual(easl.evaluate(` 
                {let app (f a) (f a)}
                (app {lambda (a) (* 2 a)}  2)            `), 4);
        });
    });

    describe("given a let lambda as arg with other args", function () {
        it("calc", function () {
            assert.strictEqual(easl.evaluate(` 
                {let app (f a b) (f a b)}
                {let sum {lambda (a b) (+ a b)}}
                (app sum 2 3)                          `), 5);
        });
    });

    describe("given a let lambda as arg with one arg 1", function () {
        it("calc", function () {
            assert.strictEqual(easl.evaluate(` 
                {let app (f a) (f a)}
                {let double {lambda (a) (* 2 a)}}
                (app double  2)                       `), 4);
        });
    });

    describe("given a let lambda as arg with one arg 2", function () {
        it("calc", function () {
            assert.strictEqual(easl.evaluate(` 
                {let app (f a) (f a)}
                {let double {lambda (a) (* 2 a)}}
                (app double 2)                         `), 4);
        });
    });

    describe("given a function as arg with other args", function () {
        it("calc", function () {
            assert.strictEqual(easl.evaluate(` 
                {let app (f a b) (f a b)}
                (let sum (a b) (+ a b)}
                (app sum 2 3)                          `), 5);
        });
    });

    describe("given a function as arg with one arg 1", function () {
        it("calc", function () {
            assert.strictEqual(easl.evaluate(` 
                {let app (f a) (f a)}
                (let double (a) (* 2 a)}
                (app double 2)                         `), 4);
        });
    });

    describe("given a function as arg with one arg 2", function () {
        it("calc", function () {
            assert.strictEqual(easl.evaluate(` 
                {let fun-apply (f a) (f a)}
                (let double (a) (* a 2)}
                (fun-apply double 2)                         `), 4);
        });
    });

    it("function returns a builtin function", function () {
        assert.strictEqual(easl.evaluate(` 
                (let opp () +)
                ((opp) 2 3)                         `), 5);
    });

    it("cannot redefine parameter from body - one expr", function () {
        assert.strictEqual(easl.evaluate(` 
                (let fn (a)
                    (let a 1))
                (fn 5)
        `), "Error: Identifier already defined: a");
    });

    it("can redefine parameter from body - many expr", function () {
        assert.strictEqual(easl.evaluate(` 
                (let fn (a)
                    (let a 1)
                    a)
                (fn 5)                              `), 1);
    });
});

