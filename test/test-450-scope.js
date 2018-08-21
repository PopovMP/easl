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

    it("function doesn't access vars defined after the function call", function () {
        assert.strictEqual(easl.evaluate(`
            {function fun () a}
            (fun) 
            {let a 1}            `), "Error: Unbound identifier: a");
    });


    it("The var defined in a function body are not accessed from outside the function", function () {
        assert.strictEqual(easl.evaluate(`
            {function fun ()
               {let a 1} }
            (fun) 
            a                    `), "Error: Unbound identifier: a");
    });

    it("The vars defined in the function body doesn't override vars defined before the function", function () {
        assert.strictEqual(easl.evaluate(`
            {let a 1}
            {function fun ()
               {let a 2} }
            (fun) 
            a                    `), 1);
    });

    it("The vars defined in the function body doesn't override vars defined after the function", function () {
        assert.strictEqual(easl.evaluate(`
            {function fun ()
               {let a 2} }
            {let a 1}
            (fun) 
            a                    `), 1);
    });

    it("Function from outer scope has access to vars from the scope before its call.", function () {
        assert.strictEqual(easl.evaluate(`
            {function foo ()
               {let a 1}
               {bar) }
            {function bar () a}
            (foo)                `), 1);
    });

});