"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('str library', function () {

    describe('str.length', function () {
        it('empty string', function () {
            assert.strictEqual(easl.evaluate(`(str.length "")`), 0);
        });

        it('non empty string', function () {
            assert.strictEqual(easl.evaluate(`(str.length "hello")`), 5);
        });
    });

    describe('str.has?', function () {
        it('non existing substring', function () {
            assert.strictEqual(easl.evaluate(`(str.has? "hello" "la")`), false);
        });

        it('existing substring', function () {
            assert.strictEqual(easl.evaluate(`(str.has? "hello" "lo")`), true);
        });
    });


    describe('str.split', function () {
        it('not a string', function () {
            assert.strictEqual(easl.evaluate(`(str.split 42)`), "Error: Not a string: 42");
        });

        it('no separator', function () {
            assert.deepStrictEqual(easl.evaluate(`(str.split "hello") `), ['h', 'e', 'l', 'l', 'o']);
        });

        it('with separator', function () {
            assert.deepStrictEqual(easl.evaluate(`(str.split "this-is-a-sentence" "-")`), ['this', 'is', 'a', 'sentence']);
        });
    });

    describe('str.to-lowercase', function () {
        it('not a string', function () {
            assert.strictEqual(easl.evaluate(`
                (str.to-lowercase  42)              `), "Error: Not a string: 42");
        });
        it('lowercase', function () {
            assert.strictEqual(easl.evaluate(`
                (str.to-lowercase  "hello")         `), "hello");
        });
        it('mixed case', function () {
            assert.strictEqual(easl.evaluate(`
                (str.to-lowercase  "Hello")         `), "hello");
        });
        it('uppercase', function () {
            assert.strictEqual(easl.evaluate(`
                (str.to-lowercase  "HELLO")         `), "hello");
        });
    });

    describe('str.to-uppercase', function () {
        it('not a string', function () {
            assert.strictEqual(easl.evaluate(`
                (str.to-uppercase  42)              `), "Error: Not a string: 42");
        });
        it('lowercase', function () {
            assert.strictEqual(easl.evaluate(`
                (str.to-uppercase  "hello")         `), "HELLO");
        });
        it('mixed case', function () {
            assert.strictEqual(easl.evaluate(`
                (str.to-uppercase  "Hello")         `), "HELLO");
        });
        it('uppercase', function () {
            assert.strictEqual(easl.evaluate(`
                (str.to-uppercase  "HELLO")         `), "HELLO");
        });
    });
});
