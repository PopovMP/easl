"use strict";

const assert = require("assert");
const {describe, it} = require("@popovmp/mocha-tiny");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();


describe("case", function () {
    it("One clause with number", function () {
        assert.strictEqual(easl.evaluate(`
            (case 1
                ((1 2 3) "ok") )            `), "ok");
    });

    it("One clause with expression", function () {
        assert.strictEqual(easl.evaluate(`
            (case (+ 1 2)
                ((1 2 3) "ok") )            `), "ok");
    });

    it("Not in options", function () {
        assert.strictEqual(easl.evaluate(`
            (case 3
                ((2) "ok") )                `), undefined);
    });

    it("Two clauses", function () {
        assert.strictEqual(easl.evaluate(` 
            (let n 2)
            (let type (case n
                         ((0 2 4 6 8) "even")
                         ((1 3 5 7 9)  "odd") ))
            type                            `), "even");
    });

    it("Else", function () {
        assert.strictEqual(easl.evaluate(` 
            (let n "hello")
            (let type (case n
                         ((0 2 4 6 8) "even")
                         ((1 3 5 7 9)  "odd")
                         (else "mhm") ))
            type                            `), "mhm");
    });

    it("Not a case", function () {
        assert.strictEqual(easl.evaluate(` 
            (let n "hello")
            (let type (case n
                         ((0 2 4 6 8) "even")
                         ((1 3 5 7 9)  "odd") ))
            type                            `),
            "Error: cannot set unspecified value to symbol: type.");
    });

    it("multiple expressions", function () {
        assert.strictEqual(easl.evaluate(`
            (case 1
                ((1) 1 2 3) )               `), 3);
    });

    it("symbol", function () {
        assert.strictEqual(easl.evaluate(`
            (case 'a
                ((a) "A") )               `), "A");
    });

    it("string", function () {
        assert.strictEqual(easl.evaluate(`
            (case "a"
                ((a) "A") )               `), "A");
    });

    it("match [", function () {
        assert.strictEqual(easl.evaluate(`
            (case "["
                (("[") 3) )               `), 3);
    });

    it("match ]", function () {
        assert.strictEqual(easl.evaluate(`
            (case "]"
                (("]") 3) )               `), 3);
    });
});
