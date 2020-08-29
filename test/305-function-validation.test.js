"use strict";

const assert = require("assert");
const {describe, it} = require("@popovmp/mocha-tiny");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('function validation', function () {
    it('valid args with unless', function () {
        assert.strictEqual(easl.evaluate(` 
            (let double (a)
                (unless (equal (type-of a) "number")
                    (throw "Wrong parameter type"))
                (* a 2))

            (double 3)
                                             `), 6);
    });

    it('invalid args with unless', function () {
        assert.strictEqual(easl.evaluate(` 
            (let double (a)
                (unless (equal (type-of a) "number")
                    (throw "Wrong parameter type"))
                (* a 2))

            (double "3")
                                             `), "Wrong parameter type");
    });

});
