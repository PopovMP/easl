"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();


describe('case', function () {
    it('One clause with number', function () {
        assert.strictEqual(easl.evaluate(`
            {case 1
                {[1 2 3] "ok"} }            `), "ok");
    });

    it('One clause with expression', function () {
        assert.strictEqual(easl.evaluate(`
            {case (+ 1 2)
                {[1 2 3] "ok"} }            `), "ok");
    });

    it('Clause with single number', function () {
        assert.strictEqual(easl.evaluate(`
            {case 1
                {1 "ok"} }                  `), "ok");
    });
    it('Clause with single number and body number', function () {
        assert.strictEqual(easl.evaluate(`
            {case 1
                {1 1} }                  `), 1);
    });
    it('Two clauses with single number and body number', function () {
        assert.strictEqual(easl.evaluate(`
            {case 2
                {1 1}
                {2 2} }                  `), 2);
    });

    it('Not in options', function () {
        assert.strictEqual(easl.evaluate(`
            {case 3
                {[2] "ok"} }                `), null);
    });

    it('A clause with empty body', function () {
        assert.strictEqual(easl.evaluate(`
            {case 1
                {1}
                {else 2} }                  `), null);
    });

    it('Two clauses', function () {
        assert.strictEqual(easl.evaluate(` 
            {let n 2}
            {let type {case n
                         {[0 2 4 6 8] "even"}
                         {[1 3 5 7 9]  "odd"} }}
            type                            `), "even");
    });

    it('Else', function () {
        assert.strictEqual(easl.evaluate(` 
            {let n "hello"}
            {let type {case n
                         {[0 2 4 6 8] "even"}
                         {[1 3 5 7 9]  "odd"}
                         {else "mhm"} }}
            type                            `), "mhm");
    });

    it('Not a case', function () {
        assert.strictEqual(easl.evaluate(` 
            {let n "hello"}
            {let type {case n
                         {[0 2 4 6 8] "even"}
                         {[1 3 5 7 9]  "odd"} }}
            type                            `), null);
    });

    it('multiple expressions', function () {
        assert.strictEqual(easl.evaluate(`
            {case 1
                {[1] 1 2 3} }               `), 3);
    });

    it('match var', function () {
        assert.strictEqual(easl.evaluate(`
            {let a 1}
            {case 1
                ([a] 3) }               `), 3);
    });


    it('match [', function () {
        assert.strictEqual(easl.evaluate(`
            {case "["
                {["["] 3} }               `), 3);
    });

    it('match ]', function () {
        assert.strictEqual(easl.evaluate(`
            {case "]"
                {["]"] 3} }               `), 3);
    });

});
