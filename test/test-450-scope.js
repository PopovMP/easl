"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('scope', function () {
    it("function accesses vars defined before the function definition", function () {
        assert.strictEqual(easl.evaluate(`
            {let a 1}
            {function fun () a}
            (fun)               `), 1);
    });

    it("function accesses vars defined after the function definition but before the call", function () {
        assert.strictEqual(easl.evaluate(`
            {function fun () a}
            {let a 1}
            (fun)                `), 1);
    });

    it("The vars defined in the function body doesn't override vars defined before the function", function () {
        assert.strictEqual(easl.evaluate(`
            {let a 1}
            {function fun ()
               {let a 2}
               {let b a} }
            (fun) 
            a                    `), 1);
    });

    it("The vars defined in the function body doesn't override vars defined after the function", function () {
        assert.strictEqual(easl.evaluate(`
            {function fun ()
               {let a 2}
               {let b a} }
            {let a 1}
            (fun) 
            a                    `), 1);
    });

    it("Function in a function see vars from outer scope", function () {
        assert.strictEqual(easl.evaluate(`
            {function foo ()
               {function bar () a}
               {let a 1}
               (bar) }
            
            (foo)                `), 1);
    });

    it("function doesn't access global vars defined after the function call", function () {
        assert.strictEqual(easl.evaluate(`
            {function fun () a}
            (fun) 
            {let a 1}            `), "Error: Unbound identifier: a");
    });

    it("The var defined in a function body are not accessed from outside the function", function () {
        assert.strictEqual(easl.evaluate(`
            {function fun ()
               {let a 1}
               a }
            (fun) 
            a                    `), "Error: Unbound identifier: a");
    });

    it("Function from outer scope doesn't see vars from the scope before its call.", function () {
        assert.strictEqual(easl.evaluate(`
            {function foo ()
               {let a 1}
               (bar) }
            {function bar () a}
            (foo)                `), "Error: Unbound identifier: a");
    });

    it("'for' is a scope", function () {
        assert.strictEqual(easl.evaluate(`
            {for (i 0) (< i 2) (+ i 1)
                {let a 1} }
            a                 `), "Error: Unbound identifier: a");
    });

    it("'while' is a scope", function () {
        assert.strictEqual(easl.evaluate(`
            {let n 0}
            {while (< n 2)
                {let a 1}
                {set! n (+ n 1)} }
            a                 `), "Error: Unbound identifier: a");
    });

    it("'do' is a scope", function () {
        assert.strictEqual(easl.evaluate(`
            {let n 0}
            {do
                {let a 1}
                {set! n (+ n 1)}
                (< n 2) }
            a                 `), "Error: Unbound identifier: a");
    });

    it("'block' is a scope", function () {
        assert.strictEqual(easl.evaluate(`
            {block
                {let a 1} }
            a                 `), "Error: Unbound identifier: a");
    });

    it("'cond' is a scope", function () {
        assert.strictEqual(easl.evaluate(`
            {cond
                {true {let a 1}} }
            a                 `), "Error: Unbound identifier: a");
    });

    it("'case' is a scope", function () {
        assert.strictEqual(easl.evaluate(`
            {case 5
                {[5] {let a 1}} }
            a                 `), "Error: Unbound identifier: a");
    });
});
