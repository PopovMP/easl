"use strict";

const assert = require("assert");
const {describe, it} = require("@popovmp/mocha-tiny");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('block', function () {

    it('(block) → Error', function () {
        assert.strictEqual(easl.evaluate("(block)"),
            "Error: Empty block");
    });

    it('(block 1) → 1', function () {
        assert.strictEqual(easl.evaluate("(block 1)"), 1);
    });

    it('(block 1 2) → 2', function () {
        assert.strictEqual(easl.evaluate("(block 1 2)"), 2);
    });

    it('(block (+ 7 1) (+ 1 2)) → 3', function () {
        assert.strictEqual(easl.evaluate("(block (+ 7 1) (+ 1 2))"), 3);
    });

    it('let in block', function () {
        assert.strictEqual(easl.evaluate(`
            (block
                (let a 5)
                (let b 6)
                (+ a b) )           `), 11);
    });

    it('nested block', function () {
        assert.strictEqual(easl.evaluate(`
            (block
                (block
                    (block
                        (let a 5)
                        (let b 6)
                        (+ a b) ))) `), 11);
    });

    it('scope accessible from inner block', function () {
        assert.strictEqual(easl.evaluate(`
            (block
                (let a 5)
                (block
                    (let b 6)
                    (block
                       (+ a b) )))  `), 11);
    });

    it('proper shadowing', function () {
        assert.strictEqual(easl.evaluate(`
            (let a 3)
            (let res 0)
            (block
                (let a 5)
                (block
                    (let a 6)
                    (inc res a))
                (inc res a))
            (inc res a)
            res                   `), 14);
    });

    it('block in function', function () {
        assert.strictEqual(easl.evaluate(`
            (let f ()
                (block
                    (let a 5)
                    (let b 6)
                    (+ a b) ))
            (f)                     `), 11);
    });

    it('function in block', function () {
        assert.strictEqual(easl.evaluate(`
            (block
                (let sum (a b) (+ a b))
                (sum 2 3) )         `), 5);
    });

    it('block closure', function () {
        assert.strictEqual(easl.evaluate(`
            (const count (block
                            (let a 0)
                            (lambda ()
                                (inc a))))
            (count) (count) (count)`), 3);
    });
});
