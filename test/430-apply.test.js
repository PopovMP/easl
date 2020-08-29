"use strict";

const assert = require("assert");
const {describe, it} = require("@popovmp/mocha-tiny");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('apply', function () {
    it('apply let lambda with an empty list of args', function () {
        assert.strictEqual(easl.evaluate(`
            {let lam {lambda () 5}}
            {apply lam '()}                           `), 5);
    });

    it('apply let lambda with one arg - number', function () {
        assert.strictEqual(easl.evaluate(`
            {let double {lambda (n) (* 2 n)}}
            {apply double '(2)}                       `), 4);
    });

    it('apply let lambda with one arg - string', function () {
        assert.strictEqual(easl.evaluate(`
            {let identity {lambda (a) a}}
            {apply identity '("hello")}               `), "hello");
    });

    it('apply let lambda with list of args', function () {
        assert.strictEqual(easl.evaluate(`
            {let sum {lambda (a b) (+ a b)}}
            {apply sum '(2 3)}                        `), 5);
    });

    it('apply let lambda with list of args string', function () {
        assert.strictEqual(easl.evaluate(`
            (let concat (lambda (a b c) (~ a b c)))
            (apply concat '(hello " " world))     `), "hello world");
    });


    it('apply function with empty list of args', function () {
        assert.strictEqual(easl.evaluate(`
            {let f () 5}
            {apply f '()}                             `), 5);
    });

    it('apply function with one arg - number', function () {
        assert.strictEqual(easl.evaluate(`
            {let double (n) (* 2 n)}
            {apply double '(2)}                       `), 4);
    });

    it('apply function with one arg - string', function () {
        assert.strictEqual(easl.evaluate(`
            {let id (a) a}
            {apply id '("hello")}               `), "hello");
    });

    it('apply function with list of args', function () {
        assert.strictEqual(easl.evaluate(`
            {let sum (a b) (+ a b)}
            {apply sum '(2 3)}                        `), 5);
    });

    it('apply lambda with list of num args', function () {
        assert.strictEqual(easl.evaluate(`
            {apply {lambda (a b) (+ a b)} '(2 3)}     `), 5);
    });

    it('apply lambda with list of string args', function () {
        assert.strictEqual(easl.evaluate(`
            {apply {lambda (a b) (~ a b)} '("2" "3")} `), "23");
    });

    it('apply builtin function with numbers', function () {
        assert.strictEqual(easl.evaluate(`
            {apply + '(2 3 4 5 6)}                    `), 20);
    });

    it('apply builtin function with strings', function () {
        assert.strictEqual(easl.evaluate(`
            {apply ~ '("a" "b" "c")}                  `), "abc");
    });

    it('apply or with trues', function () {
        assert.strictEqual(easl.evaluate(`
            {apply or '(true true true)}              `), true);
    });

    it('apply or with true, false', function () {
        assert.strictEqual(easl.evaluate(`
            {apply or '(true false)}                  `), true);
    });

    it('apply and with trues', function () {
        assert.strictEqual(easl.evaluate(`
            {apply and '(true true true)}             `), true);
    });

    it('apply and with true, false', function () {
        assert.strictEqual(easl.evaluate(`
            {apply and '(true false)}                 `), false);
    });

    it('apply builtin function with an array', function () {
        assert.strictEqual(easl.evaluate(`
            {apply list-length (list (list 2 3 4 5 6))}        `), 5);
    });

    it('apply builtin function with defined empty list', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst '()}
            {apply * lst}                            `), 1);
    });

    it('apply builtin function with defined non empty list', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst '(3 4)}
            {apply + lst}                            `), 7);
    });

    it('apply builtin function with defined list of strings', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst '("a" "b")}
            {apply ~ lst}                            `), "ab");
    });

    it('apply or with defined list of booleans 1', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst '(true true)}
            {apply or lst}                            `), true);
    });

    it('apply builtin function with list of num vars', function () {
        assert.strictEqual(easl.evaluate(`
            (let x 1)
            (let y 2)
            (let lst (list x y))
            (apply + lst)                            `), 3);
    });

    it('apply builtin function with list of string vars', function () {
        assert.strictEqual(easl.evaluate(`
            (let x "a")
            (let y "b")
            (let lst (list x y))
            (apply ~ lst)                            `), "ab");
    });

    it('apply builtin function with list of boolean vars', function () {
        assert.strictEqual(easl.evaluate(`
            (let f false)
            (let t true)
            (let lst (list f t))
            (apply and lst)                            `), false);
    });

    it('apply or list of null and num', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst '(null 42)}
            {apply or lst}                            `), 42);
    });

    it('apply or list of null and string', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst '(null "a")}
            {apply or lst}                            `), "a");
    });

    it('apply or list of null and boolean', function () {
        assert.strictEqual(easl.evaluate(`
            {let lst '(null true)}
            {apply or lst}                            `), true);
    });

    it('apply builtin function with list of boolean true', function () {
        assert.strictEqual(easl.evaluate(`
            (let t1 true)
            (let t2 true)
            (let t3 42)
            (let lst (list t1 t2 t3))
            (apply and lst)                            `), 42);
    });

    it('apply with expression, which produces num list', function () {
        assert.strictEqual(easl.evaluate(`
            (apply + (list-range 4 1))           `), 10);
    });

    it('apply with expression, which produces string list', function () {
        assert.strictEqual(easl.evaluate(`
            (apply ~ (list-concat '(a b) '(c)))       `), "abc");
    });

    it('factorial 5', function () {
        assert.strictEqual(easl.evaluate(`
            {apply * (list-range 5 1)}               `), 120);
    });

    it('factorial 5 - 2', function () {
        assert.strictEqual(easl.evaluate(`
            (let lst (list-range 5 1))
            (apply * lst)                            `), 120);
    });
});
