"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('Eval basics', function () {
    describe('Built in constants', function () {
        it('digits: 1 → 1', function () {
            assert.strictEqual(easl.evaluate("1"), 1);
        });
        it('null: null → null', function () {
            assert.strictEqual(easl.evaluate("null"), null);
        });
        it('boolean: true → true', function () {
            assert.strictEqual(easl.evaluate("true"), true);
        });
        it('boolean: false → false', function () {
            assert.strictEqual(easl.evaluate("false"), false);
        });
        it('string:\'"John"\' → "John"', function () {
            assert.strictEqual(easl.evaluate('"John"'), "John");
        });
    });

    describe('Faulty values', function () {
        it('false: (if false 1 2) → 2', function () {
            assert.strictEqual(easl.evaluate("(if false 1 2)"), 2);
        });
        it('null: (if null 1 2) → 2', function () {
            assert.strictEqual(easl.evaluate("(if null 1 2)"), 2);
        });
        it('empty list: (if [] 1 2) → 2', function () {
            assert.strictEqual(easl.evaluate("(if [] 1 2)"), 2);
        });
        it('empty string', function () {
            assert.strictEqual(easl.evaluate('(if "" 1 2)'), 2);
        });
        it('zero: (if 0 1 2) → 2', function () {
            assert.strictEqual(easl.evaluate("(if 0 1 2)"), 2);
        });
    });

    describe('Truthy values', function () {
        it('true: (if true 1 2) → 1', function () {
            assert.strictEqual(easl.evaluate("(if true 1 2)"), 1);
        });
        it('non empty list: (if [1] 1 2) → 1', function () {
            assert.strictEqual(easl.evaluate("(if [1] 1 2)"), 1);
        });
        it('empty string', function () {
            assert.strictEqual(easl.evaluate('(if "hello" 1 2)'), 1);
        });
        it('number: (if 42 1 2) → 1', function () {
            assert.strictEqual(easl.evaluate("(if 42 1 2)"), 1);
        });
    });

    describe('Type predicates', function () {
        it('(boolean? true) → true', function () {
            assert.strictEqual(easl.evaluate("(boolean? true)"), true);
        });
        it('(boolean? false) → true', function () {
            assert.strictEqual(easl.evaluate("(boolean? false)"), true);
        });
        it('(boolean? 42) → false', function () {
            assert.strictEqual(easl.evaluate("(boolean? 42)"), false);
        });

        it('(number? 0) → true', function () {
            assert.strictEqual(easl.evaluate("(number? 0)"), true);
        });
        it('(number? 42) → true', function () {
            assert.strictEqual(easl.evaluate("(number? 42)"), true);
        });
        it('(number? -5) → true', function () {
            assert.strictEqual(easl.evaluate("(number? -5)"), true);
        });
        it('(number? 3.14) → true', function () {
            assert.strictEqual(easl.evaluate("(number? 3.14)"), true);
        });
        it('(number? -123-456-300.7) → true', function () {
            assert.strictEqual(easl.evaluate("(number? -123-456-300.7)"), true);
        });
        it('(number? "42") → false', function () {
            assert.strictEqual(easl.evaluate('(number? "42")'), false);
        });


        it('(string? "") → true', function () {
            assert.strictEqual(easl.evaluate('(string? "")'), true);
        });
        it('(string? "hello") → false', function () {
            assert.strictEqual(easl.evaluate('(string? "hello")'), true);
        });
        it('(string? 42) → false', function () {
            assert.strictEqual(easl.evaluate("(string? 42)"), false);
        });

        it('(null? null) → true', function () {
            assert.strictEqual(easl.evaluate("(null? null)"), true);
        });
        it('(null? []) → false', function () {
            assert.strictEqual(easl.evaluate("(null? [])"), false);
        });
        it('(null? (list)) → false', function () {
            assert.strictEqual(easl.evaluate("(null? (list))"), false);
        });
        it('(null? 0) → false', function () {
            assert.strictEqual(easl.evaluate("(null? 0)"), false);
        });


        it('(list? []) → true', function () {
            assert.strictEqual(easl.evaluate("(list? [])"), true);
        });
        it('(list? (list)) → true', function () {
            assert.strictEqual(easl.evaluate("(list? (list))"), true);
        });
        it('(list? (list 1 2)) → true', function () {
            assert.strictEqual(easl.evaluate("(list? (list 1 2))"), true);
        });
        it('(list? [1 2]) → true', function () {
            assert.strictEqual(easl.evaluate("(list? [1 2])"), true);
        });
        it('(list? [1 (+ 2 3)]) → true', function () {
            assert.strictEqual(easl.evaluate("(list? [1 (+ 2 3)])"), true);
        });
        it('(list? 1) → false', function () {
            assert.strictEqual(easl.evaluate("(list? 1)"), false);
        });


        it('(pair? []) → false', function () {
            assert.strictEqual(easl.evaluate("(pair? [])"), false);
        });
        it('(pair? (list)) → false', function () {
            assert.strictEqual(easl.evaluate("(pair? (list))"), false);
        });
        it('(pair? (list 1 2)) → true', function () {
            assert.strictEqual(easl.evaluate("(pair? (list 1 2))"), true);
        });
        it('(pair? [1 2]) → true', function () {
            assert.strictEqual(easl.evaluate("(pair? [1 2])"), true);
        });
        it('(pair? [1 (+ 2 3)]) → true', function () {
            assert.strictEqual(easl.evaluate("(pair? [1 (+ 2 3)])"), true);
        });
        it('(pair? 1) → false', function () {
            assert.strictEqual(easl.evaluate("(pair? 1)"), false);
        });

    });

    describe('List declaration', function () {
        it('empty list: [] → []', function () {
            assert.deepStrictEqual(easl.evaluate("[]"), []);
        });
        it('empty list: (list) → []', function () {
            assert.deepStrictEqual(easl.evaluate("(list)"), []);
        });
        it('non empty list: (list 1 2 3) → [1 2 3]', function () {
            assert.deepStrictEqual(easl.evaluate("(list 1 2 3)"), [1, 2, 3]);
        });
        it('non empty list: [1 2 3] → [1 2 3]', function () {
            assert.deepStrictEqual(easl.evaluate("[1 2 3]"), [1, 2, 3]);
        });
        it('non empty list: [1 (- 5 3) 3] → [1 2 3]', function () {
            assert.deepStrictEqual(easl.evaluate("[1 (- 5 3) 3]"), [1, 2, 3]);
        });
    });

    describe('Number operators', function () {
        it('add: (+ 1 2) → 3', function () {
            assert.strictEqual(easl.evaluate("(+ 1 2)"), 3);
        });
        it('add: (+ (+ 1 2) 3) → 6', function () {
            assert.strictEqual(easl.evaluate("(+ (+ 1 2) 3)"), 6);
        });
        it('subtract: (- 3 1) → 2', function () {
            assert.strictEqual(easl.evaluate("(- 3 1)"), 2);
        });
        it('subtract: (- (+ 3 2) 1) → 4', function () {
            assert.strictEqual(easl.evaluate("(- (+ 3 2) 1)"), 4);
        });

    });

    describe('Build list with cons', function () {
        it('(cons 1 null) → [1]', function () {
            assert.deepStrictEqual(easl.evaluate("(cons 1 null)"), [1]);
        });
        it('(cons 1 (list)) → [1]', function () {
            assert.deepStrictEqual(easl.evaluate("(cons 1 (list))"), [1]);
        });
        it('(cons 1 2) → [1, 2]', function () {
            assert.deepStrictEqual(easl.evaluate("(cons 1 2)"), [1, 2]);
        });
        it('(cons 1 [2 3]) → [1, 2, 3]', function () {
            assert.deepStrictEqual(easl.evaluate("(cons 1 [2 3])"), [1, 2, 3]);
        });
    });

    describe('Eval multiple expressions', function () {
        it('1 2 → 2', function () {
            assert.deepStrictEqual(easl.evaluate("1 2"), 2);
        });
        it('3 (+ 1 1) → 2', function () {
            assert.deepStrictEqual(easl.evaluate("3 (+ 1 1)"), 2);
        });
    });

});
