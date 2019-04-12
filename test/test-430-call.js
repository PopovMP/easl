"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('call', function () {
    it('call let lambda with an empty list of args', function () {
        assert.strictEqual(easl.evaluate(`
            {let lam {lambda () 5}}
            {call lam []}                           `), 5);
    });

    it('call let lambda with one arg - number', function () {
        assert.strictEqual(easl.evaluate(`
            {let double {lambda n (* 2 n)}}
            {call double [2]}                       `), 4);
    });

    it('call let lambda with one arg - string', function () {
        assert.strictEqual(easl.evaluate(`
            {let identity {lambda a a}}
            {call identity ["hello"]}               `), "hello");
    });

    it('call let lambda with list of args', function () {
        assert.strictEqual(easl.evaluate(`
            {let sum {lambda (a b) (+ a b)}}
            {call sum [2 3]}                        `), 5);
    });

    it('call let lambda with list of args string', function () {
        assert.strictEqual(easl.evaluate(`
            {let concat {lambda (a b c) (+ a b c)}}
            {call concat ["hello" " " "world"]}     `), "hello world");
    });


    it('call function with empty list of args', function () {
        assert.strictEqual(easl.evaluate(`
            {function f () 5}
            {call f []}                             `), 5);
    });

    it('call function with one arg - number', function () {
        assert.strictEqual(easl.evaluate(`
            {function double n (* 2 n)}
            {call double [2]}                       `), 4);
    });

    it('call function with one arg - string', function () {
        assert.strictEqual(easl.evaluate(`
            {function identity a a}
            {call identity ["hello"]}               `), "hello");
    });

    it('call function with list of args', function () {
        assert.strictEqual(easl.evaluate(`
            {function sum (a b) (+ a b)}
            {call sum [2 3]}                        `), 5);
    });

    it('call builtin function with numbers', function () {
        assert.strictEqual(easl.evaluate(`
            {call + [2 3 4 5 6]}                    `), 20);
    });

    it('call builtin function with strings', function () {
        assert.strictEqual(easl.evaluate(`
            {call + ["a" "b" "c"]}                  `), "abc");
    });

    it('call builtin function with an array', function () {
        assert.strictEqual(easl.evaluate(`
            {call list.length [[2 3 4 5 6]]}        `), 5);
    });

    it('call builtin function with defined empty list', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst []}
            {call * lst}                            `), 0);
    });

    it('call builtin function with defined non empty list', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst [3 4]}
            {call + lst}                            `), 7);
    });

    it('call with expression', function () {
        assert.strictEqual(easl.evaluate(`
            {call + (list.add [1 2 3] 4)}           `), 10);
    });

    it('factorial 5', function () {
        assert.strictEqual(easl.evaluate(`
            {call * (list.range 1 5)}               `), 120);
    });

    it('factorial 5 - 2', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst (list.range 1 5)}
            {call * lst}                            `), 120);
    });
});
