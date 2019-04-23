"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('function validation', function () {
    it('valid args with unless', function () {
        assert.strictEqual(easl.evaluate(` 
            {function double a
                {unless (= (type-of a) "number") {throw "Wrong parameter type"}}
                (* a 2)}

            (double 3)
                                             `), 6);
    });

    it('invalid args with unless', function () {
        assert.strictEqual(easl.evaluate(` 
            {function double a
                {unless (= (type-of a) "number") {throw "Wrong parameter type"}}
                (* a 2)}

            (double "3")
                                             `), "Wrong parameter type");
    });

});
