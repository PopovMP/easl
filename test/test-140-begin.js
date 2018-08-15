"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('begin', function () {

    it('{begin 1} → 1', function () {
        assert.strictEqual(easl.evaluate("{begin 1}"), 1);
    });

    it('{begin 1 2} → 2', function () {
        assert.strictEqual(easl.evaluate("{begin 1 2}"), 2);
    });

    it('{begin (+ 7 1) (+ 1 2)} → 3', function () {
        assert.strictEqual(easl.evaluate("{begin (+ 7 1) (+ 1 2)}"), 3);
    });

    it('let in begin', function () {
        assert.strictEqual(easl.evaluate(`
        {begin
                {let a 5}
                {let b 6}
                (+ a b) }
        `), 11);
    });

    it('nested begin', function () {
        assert.strictEqual(easl.evaluate(`
        {begin
            {begin
                {begin
                        {let a 5}
                        {let b 6}
                        (+ a b) }}}
        `), 11);
    });

    it('scope accessible from inner begin', function () {
        assert.strictEqual(easl.evaluate(`
        {begin
            {let a 5}
            {begin
                {let b 6}
                {begin
                   (+ a b) }}}
        `), 11);
    });

    it('begin in function', function () {
        assert.strictEqual(easl.evaluate(`
            {function ff ()
                {begin
                        {let a 5}
                        {let b 6}
                        (+ a b) }}
            (ff)
        `), 11);
    });

    it('function in begin', function () {
        assert.strictEqual(easl.evaluate(`
        {begin
            {function sum (a b) (+ a b)}
            (sum 2 3) }
        `), 5);
    });

});
