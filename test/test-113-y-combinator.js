"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();


describe('lambda - Y combinator', function () {
    it('!5 → 120', function () {
        assert.strictEqual(easl.evaluate(`

    (((lambda (!) (lambda (n) ((! !) n)))
      (lambda (!) (lambda (n) (if (= n 0)
                                  1
                                  (* ((! !) (- n 1))
                                     n))))) 5)           `), 120);

    });
});
