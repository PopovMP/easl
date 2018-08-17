"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();


describe('while', function () {
    it('test while', function () {
        assert.strictEqual(easl.evaluate(` 
{let n 1 }                         ; initialize a counter

{while (<= n 10)                   ; evaluate the condition
                                   ; repeat the loop until the condition is true
;   (print  (+ "It is number " n)) ; the 'while' loop body
    {set! n (+ n 1)} }             ; increase the counter and return back
             
n                                                   `), 11);
    });
});

