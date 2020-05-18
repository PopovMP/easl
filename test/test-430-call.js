"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('call', function () {
    it('call let lambda with an empty list of args', function () {
        assert.strictEqual(easl.evaluate(`
            {let lam {lambda () 5}}
            {call lam []}                           `), 5);
    });

    it('call let lambda with one arg - number', function () {
        assert.strictEqual(easl.evaluate(`
            {let double {lambda (n) (* 2 n)}}
            {call double [2]}                       `), 4);
    });

    it('call let lambda with one arg - string', function () {
        assert.strictEqual(easl.evaluate(`
            {let identity {lambda (a) a}}
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
            {function double (n) (* 2 n)}
            {call double [2]}                       `), 4);
    });

    it('call function with one arg - string', function () {
        assert.strictEqual(easl.evaluate(`
            {function id (a) a}
            {call id ["hello"]}               `), "hello");
    });

    it('call function with list of args', function () {
        assert.strictEqual(easl.evaluate(`
            {function sum (a b) (+ a b)}
            {call sum [2 3]}                        `), 5);
    });

    it('call lambda with list of num args', function () {
        assert.strictEqual(easl.evaluate(`
            {call {lambda (a b) (+ a b)} [2 3]}     `), 5);
    });

    it('call lambda with list of string args', function () {
        assert.strictEqual(easl.evaluate(`
            {call {lambda (a b) (+ a b)} ["2" "3"]} `), "23");
    });

    it('call builtin function with numbers', function () {
        assert.strictEqual(easl.evaluate(`
            {call + [2 3 4 5 6]}                    `), 20);
    });

    it('call builtin function with strings', function () {
        assert.strictEqual(easl.evaluate(`
            {call + ["a" "b" "c"]}                  `), "abc");
    });

    it('call or with trues', function () {
        assert.strictEqual(easl.evaluate(`
            {call or [true true true]}              `), true);
    });

    it('call or with true, false', function () {
        assert.strictEqual(easl.evaluate(`
            {call or [true false]}                  `), true);
    });

    it('call and with trues', function () {
        assert.strictEqual(easl.evaluate(`
            {call and [true true true]}             `), true);
    });

    it('call and with true, false', function () {
        assert.strictEqual(easl.evaluate(`
            {call and [true false]}                 `), false);
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

    it('call builtin function with defined list of strings', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst ["a" "b"]}
            {call + lst}                            `), "ab");
    });

    it('call or with defined list of booleans 1', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst [true true]}
            {call or lst}                            `), true);
    });

    it('call builtin function with list of num vars', function () {
        assert.strictEqual(easl.evaluate(`
            {let x 1)
            {let y 2}
            {let lst [x y]}
            {call + lst}                            `), 3);
    });

    it('call builtin function with list of string vars', function () {
        assert.strictEqual(easl.evaluate(`
            {let x "a")
            {let y "b"}
            {let lst [x y]}
            {call + lst}                            `), "ab");
    });

    it('call builtin function with list of boolean vars', function () {
        assert.strictEqual(easl.evaluate(`
            {let f false)
            {let t true}
            {let lst [f t]}
            {call and lst}                            `), false);
    });

    it('call or list of null and num', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst [null 42]}
            {call or lst}                            `), 42);
    });

    it('call or list of null and string', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst [null "a"]}
            {call or lst}                            `), "a");
    });

    it('call or list of null and boolean', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst [null true]}
            {call or lst}                            `), true);
    });

    it('call builtin function with list of boolean true', function () {
        assert.strictEqual(easl.evaluate(`
            {let t1 true)
            {let t2 true}
            {let t3 42}
            {let lst [t1 t2 t3]}
            {call and lst}                            `), 42);
    });

    it('call with expression, which produces num list', function () {
        assert.strictEqual(easl.evaluate(`
            {call + (list.add [1 2 3] 4)}           `), 10);
    });

    it('call with expression, which produces string list', function () {
        assert.strictEqual(easl.evaluate(`
            {call + (list.add ["a" "b"] "c")}       `), "abc");
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
