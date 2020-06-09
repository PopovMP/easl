"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('str library', function () {

    describe('str.char-at', function () {
        it("empty string → ''", function () {
            assert.strictEqual(easl.evaluate(`(str.char-at "" 0)`),
                "");
        });
        it('index out of range → null', function () {
            assert.strictEqual(easl.evaluate(`(str.char-at "ab" 5)`),
                "");
        });
        it('index in range → char', function () {
            assert.strictEqual(easl.evaluate(`(str.char-at "ab" 1)`), "b");
        });
    });

    describe('str.char-code-at', function () {
        it('empty string → exception', function () {
            assert.strictEqual(easl.evaluate(`(str.char-code-at "" 0)`),
                "Error: 'str.char-code-at' index out of range.");
        });
        it('index out of range → exception', function () {
            assert.strictEqual(easl.evaluate(`(str.char-code-at "ab" 5)`),
                "Error: 'str.char-code-at' index out of range.");
        });
        it('match a char → number', function () {
            assert.strictEqual(easl.evaluate(`(str.char-code-at "xa" 1)`), 97);
        });
        it('match a number → number', function () {
            assert.strictEqual(easl.evaluate(`(str.char-code-at "0" 0)`), 48);
        });
    });

    describe('str.concat', function () {
        it('one strings', function () {
            assert.strictEqual(easl.evaluate(`(str.concat "a")`), "a");
        });
        it('two chars', function () {
            assert.strictEqual(easl.evaluate(`(str.concat "a" "b")`), "ab");
        });
        it('three chars', function () {
            assert.strictEqual(easl.evaluate(`(str.concat "a" "b" "c")`), "abc");
        });
        it('eval expressions', function () {
            assert.strictEqual(easl.evaluate(`(str.concat ({lambda () "a"}) (+ "b" "c"))`), "abc");
        });
    });

    describe('str.ends-with', function () {
        it('ending with', function () {
            assert.strictEqual(easl.evaluate(`(str.ends-with "hello" "lo")`), true);
        });
        it('not ending with', function () {
            assert.strictEqual(easl.evaluate(`(str.ends-with "hello" "ll")`), false);
        });
    });

    describe('str.from-char-code', function () {
        it('correct code', function () {
            assert.strictEqual(easl.evaluate(`(str.from-char-code 97)`), "a");
        });
    });

    describe('str.includes', function () {
        it('non existing substring', function () {
            assert.strictEqual(easl.evaluate(`(str.includes "hello" "la")`), false);
        });

        it('existing substring', function () {
            assert.strictEqual(easl.evaluate(`(str.includes "hello" "lo")`), true);
        });
    });

    describe('str.index-of', function () {
        it('existing string', function () {
            assert.strictEqual(easl.evaluate(`(str.index-of "hello" "ll")`), 2);
        });

        it('non existing substring', function () {
            assert.strictEqual(easl.evaluate(`(str.index-of "hello" "kk")`), -1);
        });

        it('existing string with start index', function () {
            assert.strictEqual(easl.evaluate(`(str.index-of "hello" "ll" 1)`), 2);
        });

        it('existing string with start index out of range', function () {
            assert.strictEqual(easl.evaluate(`(str.index-of "hello" "ll" 4)`), -1);
        });
    });

    describe('str.length', function () {
        it('empty string', function () {
            assert.strictEqual(easl.evaluate(`(str.length "")`), 0);
        });

        it('non empty string', function () {
            assert.strictEqual(easl.evaluate(`(str.length "hello")`), 5);
        });
    });

    describe('str.starts-with', function () {
        it('starting with', function () {
            assert.strictEqual(easl.evaluate(`(str.starts-with "hello" "hel")`), true);
        });
        it('not starting with', function () {
            assert.strictEqual(easl.evaluate(`(str.starts-with "hello" "ell")`), false);
        });
    });


    describe('str.split', function () {
        it('not a string', function () {
            assert.strictEqual(easl.evaluate(`(str.split 42)`),
                "Error: 'str.split' requires string. Given: number 42");
        });

        it('no separator', function () {
            assert.deepStrictEqual(easl.evaluate(`
                {let lst (str.split "ABC")}
                lst                                 `), ["A", "B", "C"]);
        });

        it('with separator', function () {
            assert.deepStrictEqual(easl.evaluate(`(str.split "A-B-C" "-")`), ["A", "B", "C"]);
        });
        it('new line', function () {
            assert.deepStrictEqual(easl.evaluate(`
                  (str.split "A
B
C" "\n")`                                 ), ["A", "B", "C"]);
        });
    });

    describe('str.to-lowercase', function () {
        it('not a string', function () {
            assert.strictEqual(easl.evaluate(`
                (str.to-lowercase  42)              `),
                "Error: 'str.to-lowercase' requires string. Given: number 42");
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
                (str.to-uppercase  42)              `),
                "Error: 'str.to-uppercase' requires string. Given: number 42");
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
