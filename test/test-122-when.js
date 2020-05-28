"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('when', function () {

    it('{when true} → "Error: Empty when block"', function () {
        assert.strictEqual(easl.evaluate("{when true}"), "Error: Empty 'when' block");
    });

    it('{when true 1} → 1', function () {
        assert.strictEqual(easl.evaluate("{when true 1}"), 1);
    });

    it('{when true 1 2} → 2', function () {
        assert.strictEqual(easl.evaluate("{when true 1 2}"), 2);
    });

    it('{when true (+ 7 1) (+ 1 2)} → 3', function () {
        assert.strictEqual(easl.evaluate("{when true (+ 7 1) (+ 1 2)}"), 3);
    });

    it('let in when', function () {
        assert.strictEqual(easl.evaluate(`
            {when true
                {let a 5}
                {let b 6}
                (+ a b) }           `), 11);
    });

    it('nested when', function () {
        assert.strictEqual(easl.evaluate(`
            {when true
                {when true
                    {when true
                        {let a 5}
                        {let b 6}
                        (+ a b) }}} `), 11);
    });

    it('scope accessible from inner when', function () {
        assert.strictEqual(easl.evaluate(`
            {when true
                {let a 5}
                {when true
                    {let b 6}
                    {when true
                       (+ a b) }}}  `), 11);
    });

    it('when in proc', function () {
        assert.strictEqual(easl.evaluate(`
            {let f ()
                {when true
                    {let a 5}
                    {let b 6}
                    (+ a b) }}
            (f)                     `), 11);
    });

    it('proc in when', function () {
        assert.strictEqual(easl.evaluate(`
            {when true
                {let sum (a b) (+ a b)}
                (sum 2 3) }         `), 5);
    });

    it('when false', function () {
        assert.strictEqual(easl.evaluate(`
            {when false
                3 }         `), null);
    });

});
