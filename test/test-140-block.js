"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('block', function () {

    it('{block} → "Error: Empty block"', function () {
        assert.strictEqual(easl.evaluate("{block}"), "Error: Empty block");
    });

    it('{block 1} → 1', function () {
        assert.strictEqual(easl.evaluate("{block 1}"), 1);
    });

    it('{block 1 2} → 2', function () {
        assert.strictEqual(easl.evaluate("{block 1 2}"), 2);
    });

    it('{block (+ 7 1) (+ 1 2)} → 3', function () {
        assert.strictEqual(easl.evaluate("{block (+ 7 1) (+ 1 2)}"), 3);
    });

    it('let in block', function () {
        assert.strictEqual(easl.evaluate(`
            {block
                {let a 5}
                {let b 6}
                (+ a b) }           `), 11);
    });

    it('nested block', function () {
        assert.strictEqual(easl.evaluate(`
            {block
                {block
                    {block
                        {let a 5}
                        {let b 6}
                        (+ a b) }}} `), 11);
    });

    it('scope accessible from inner block', function () {
        assert.strictEqual(easl.evaluate(`
            {block
                {let a 5}
                {block
                    {let b 6}
                    {block
                       (+ a b) }}}  `), 11);
    });

    it('block in function', function () {
        assert.strictEqual(easl.evaluate(`
            {function f ()
                {block
                    {let a 5}
                    {let b 6}
                    (+ a b) }}
            (f)                     `), 11);
    });

    it('function in block', function () {
        assert.strictEqual(easl.evaluate(`
            {block
                {function sum (a b) (+ a b)}
                (sum 2 3) }         `), 5);
    });

});
