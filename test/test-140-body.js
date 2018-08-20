"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('body', function () {

    it('{body} → "Error: empty body"', function () {
        assert.strictEqual(easl.evaluate("{body}"), "Error: empty body");
    });

    it('{body 1} → 1', function () {
        assert.strictEqual(easl.evaluate("{body 1}"), 1);
    });

    it('{body 1 2} → 2', function () {
        assert.strictEqual(easl.evaluate("{body 1 2}"), 2);
    });

    it('{body (+ 7 1) (+ 1 2)} → 3', function () {
        assert.strictEqual(easl.evaluate("{body (+ 7 1) (+ 1 2)}"), 3);
    });

    it('let in body', function () {
        assert.strictEqual(easl.evaluate(`
        {body
                {let a 5}
                {let b 6}
                (+ a b) }
        `), 11);
    });

    it('nested body', function () {
        assert.strictEqual(easl.evaluate(`
        {body
            {body
                {body
                        {let a 5}
                        {let b 6}
                        (+ a b) }}}
        `), 11);
    });

    it('scope accessible from inner body', function () {
        assert.strictEqual(easl.evaluate(`
        {body
            {let a 5}
            {body
                {let b 6}
                {body
                   (+ a b) }}}
        `), 11);
    });

    it('body in function', function () {
        assert.strictEqual(easl.evaluate(`
            {function ff ()
                {body
                        {let a 5}
                        {let b 6}
                        (+ a b) }}
            (ff)
        `), 11);
    });

    it('function in body', function () {
        assert.strictEqual(easl.evaluate(`
        {body
            {function sum (a b) (+ a b)}
            (sum 2 3) }
        `), 5);
    });

});
