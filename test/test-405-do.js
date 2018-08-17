"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();


describe('do', function () {
    it('test do', function () {
        assert.strictEqual(easl.evaluate(` 
{let n 1 }

{do

    {set! n (+ n 1)}
    (<= n 10) }
n                                                   `), 11);
    });
});

