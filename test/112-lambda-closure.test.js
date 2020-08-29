"use strict";

const assert = require("assert");
const {describe, it} = require("@popovmp/mocha-tiny");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("lambda - closure", function () {
    it("closure - 1 free param", function () {
        assert.strictEqual(easl.evaluate(`
        (((lambda (a)
            (lambda (b)
               (+ a b)))
          1) 2)
                                            `), 3);
    });

    it("closure - variable defined in body", function () {
        assert.strictEqual(easl.evaluate(`
        (((lambda ()
            (let a 1)
            (lambda (b)
               (+ a b))))
          2)
                                            `), 3);
    });
});
