"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('core-lib', function () {
    describe('+', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (+) `), "Error: Wrong number of arguments: +");
        });
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` (+ 5) `), "Error: Wrong number of arguments: +");
        });
        it('two args', function () {
            assert.strictEqual(easl.evaluate(` (+ 2 3) `), 5);
        });
        it('three args', function () {
            assert.strictEqual(easl.evaluate(` (+ 1 2 3) `), 6);
        });
    });

    describe('-', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (-) `), "Error: Wrong number of arguments: -");
        });
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` (- 5) `), -5);
        });
        it('one negative arg', function () {
            assert.strictEqual(easl.evaluate(` (- -5) `), 5);
        });
        it('two args', function () {
            assert.strictEqual(easl.evaluate(` (- 8 3) `), 5);
        });
        it('three args', function () {
            assert.strictEqual(easl.evaluate(` (- 8 3 2) `), "Error: Wrong number of arguments: -");
        });
    });

    describe('*', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (*)     `), "Error: Wrong number of arguments: *");
        });
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` (* 5)   `), "Error: Wrong number of arguments: *");
        });
        it('two args', function () {
            assert.strictEqual(easl.evaluate(` (* 2 3) `), 6);
        });
        it('three args', function () {
            assert.strictEqual(easl.evaluate(` (* 2 3 4) `), 24);
        });
    });

    describe('/', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (/)     `), "Error: Wrong number of arguments: /");
        });
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` (/ 5)   `), "Error: Wrong number of arguments: /");
        });
        it('divide by zero', function () {
            assert.strictEqual(easl.evaluate(` (/ 5 0) `), "Error: Division by zero");
        });
        it('correct division', function () {
            assert.strictEqual(easl.evaluate(` (/ 9 3) `), 3);
        });
    });

    describe('%', function () {
        it('positive numb', function () {
            assert.strictEqual(easl.evaluate(` (% 10 3) `), 1);
        });
        it('negative numb', function () {
            assert.strictEqual(easl.evaluate(` (% -10.0 3) `), -1);
        });
        it('both args negative', function () {
            assert.strictEqual(easl.evaluate(` (% -10.0 -3) `), -1);
        });
    });

    describe('=', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (=) `), "Error: Wrong number of arguments: =");
        });
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` (= 5) `), "Error: Wrong number of arguments: =");
        });
        it('two different args', function () {
            assert.strictEqual(easl.evaluate(` (= 2 3) `), false);
        });
        it('two equal args', function () {
            assert.strictEqual(easl.evaluate(` (= 3 3) `), true);
        });
        it('three equal args', function () {
            assert.strictEqual(easl.evaluate(` (= 3 3 3) `), true);
        });
        it('three equal expr', function () {
            assert.strictEqual(easl.evaluate(` (= (+ 1 2) (/ 9 3) (* 1 3)) `), true);
        });
        it('four equal expr', function () {
            assert.strictEqual(easl.evaluate(` (= (+ 1 2) (/ 9 3) (* 1 3) 3) `), true);
        });
    });

    describe('and', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (and) `), true);
        });
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` (and 5) `), 5);
        });
        it('two truthy args', function () {
            assert.strictEqual(easl.evaluate(` (and 2 3) `), 3);
        });
        it("two args", function () {
            assert.strictEqual(easl.evaluate(` (and true 0) `), 0);
        });
        it('three truthy args', function () {
            assert.strictEqual(easl.evaluate(` (and 3 0 3) `), 0);
        });
        it('three truthy expr', function () {
            assert.strictEqual(easl.evaluate(` (and (+ 1 2) (/ 9 3) (+ 3 3)) `), 6);
        });
        it('four expr', function () {
            assert.strictEqual(easl.evaluate(` (and (+ 1 2) (/ 9 3) (- 3 3) true) `), 0);
        });
    });

    describe('or', function () {
        it('no args', function () {
            assert.strictEqual(easl.evaluate(` (or) `), false);
        });
        it('one arg', function () {
            assert.strictEqual(easl.evaluate(` (or 5) `), 5);
        });
        it('two truthy args', function () {
            assert.strictEqual(easl.evaluate(` (or 2 3) `), 2);
        });
        it("two args", function () {
            assert.strictEqual(easl.evaluate(` (or true 0) `), true);
        });
        it('three truthy args', function () {
            assert.strictEqual(easl.evaluate(` (or 3 0 3) `), 3);
        });
        it('three truthy expr', function () {
            assert.strictEqual(easl.evaluate(` (or (+ 1 2) (/ 9 3) (+ 3 3)) `), 3);
        });
        it('four expr', function () {
            assert.strictEqual(easl.evaluate(` (or (- 5 5) (/ 9 3) (- 3 3) true) `), 3);
        });
    });
});
