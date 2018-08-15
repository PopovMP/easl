"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();


describe('function closure', function () {
    describe('closure', function () {
        xit('make adder', function () {
            assert.strictEqual(easl.evaluate(` 
            
                {function make-adder (a)
                    {lambda (a b) (+ a b)}}

                {let add2 (make-adder 2)}

                (add2 3)
                                                 `, false), 5);
        });
    });
});
