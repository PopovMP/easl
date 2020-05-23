"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("function closure", function () {

    it("return closure as first expression ", function () {
        assert.strictEqual(easl.evaluate(` 
            (function make-adder (m)
                (lambda (n) (+ m n)) )

            (let add2 (make-adder 2))
            (add2 3)                        `), 5);
    });

    it("return a closure as a first expression block", function () {
        assert.strictEqual(easl.evaluate(` 
            (function make-adder (m)
                (block
                    (let dummy null)
                    (lambda (n) (+ m n)) ))

            (let add2 (make-adder 2))
            (add2 3)                        `), 5);
    });

    it("return a closure as a second expression", function () {
        assert.strictEqual(easl.evaluate(` 
            (function make-adder (m)
                (let dummy null)
                (lambda (n) (+ m n)) )

            (let add2 (make-adder 2))
            (add2 3)                        `), 5);
    });

    it("return a closure as a second expression block", function () {
        assert.strictEqual(easl.evaluate(` 
            (function make-adder (m)
                (let dummy null)
                (block
                    (lambda (n) (+ m n)) ))

            (let add2 (make-adder 2))
            (add2 3)                        `), 5);
    });

});
