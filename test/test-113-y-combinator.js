"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("lambda - Y combinator", function () {
    it("!5 → 120", function () {
        assert.strictEqual(easl.evaluate(`

    (((lambda (f) (lambda (n) ((f f) n)))
      (lambda (f) (lambda (n) (if (= n 0)
                                  1
                                  (* ((f f)  (- n 1))
                                     n))))) 5)           `), 120);

    });
});
