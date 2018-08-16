"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();


describe('cond', function () {
    it('One clause with number', function () {
        assert.strictEqual(easl.evaluate(`  {cond
                                                (true 5)}          `), 5);
    });
    it('One clause with expression', function () {
        assert.strictEqual(easl.evaluate(`  {cond
                                                (true (+ 2 3))}    `), 5);
    });
    it('Two clauses: false, true', function () {
        assert.strictEqual(easl.evaluate(`  {cond
                                                (false (+ 1 2))
                                                (true  (+ 2 3))}   `), 5);
    });
    it('Two clauses: false, else', function () {
        assert.strictEqual(easl.evaluate(`  {cond
                                                (false (+ 1 2))
                                                (else  (+ 2 3))}    `), 5);
    });
    it('Multiple expressions in a clause', function () {
        assert.strictEqual(easl.evaluate(`  {cond
                                                (true (+ 1 1)
                                                      (+ 1 2)
                                                      (+ 2 3))}     `), 5);
    });
    it('Expression as a condition', function () {
        assert.strictEqual(easl.evaluate(`   {cond
                                                ((eq? 1 2) 0)
                                                ((eq? 1 1) 5)}      `), 5);
    });
});
