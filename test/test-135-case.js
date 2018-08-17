"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();


describe('case', function () {
    it('One clause with number', function () {
        assert.strictEqual(easl.evaluate(`  {case 1
                                                ([1 2 3] "ok") }     `), "ok");
    });
    it('One clause with expression', function () {
        assert.strictEqual(easl.evaluate(`  {case (+ 1 2)
                                                ([1 2 3] "ok") }     `), "ok");
    });
    it('Two clauses', function () {
        assert.strictEqual(easl.evaluate(` 
{let n 2}

{let type {case n
             ([0 2 4 6 8] "even" )
             ([1 3 5 7 9] "odd") }}
             
type                                                   `), "even");
    });
});

