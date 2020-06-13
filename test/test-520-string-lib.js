"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('str library', function () {

    describe('string-char-at', function () {
        it("empty string → ''", function () {
            assert.strictEqual(easl.evaluate(`(string-char-at "" 0)`),
                "");
        });
        it('index out of range → null', function () {
            assert.strictEqual(easl.evaluate(`(string-char-at "ab" 5)`),
                "");
        });
        it('index in range → char', function () {
            assert.strictEqual(easl.evaluate(`(string-char-at "ab" 1)`), "b");
        });
    });

    describe('string-char-code-at', function () {
        it('empty string → exception', function () {
            assert.strictEqual(easl.evaluate(`(string-char-code-at "" 0)`),
                "Error: 'string-char-code-at' index out of range.");
        });
        it('index out of range → exception', function () {
            assert.strictEqual(easl.evaluate(`(string-char-code-at "ab" 5)`),
                "Error: 'string-char-code-at' index out of range.");
        });
        it('match a char → number', function () {
            assert.strictEqual(easl.evaluate(`(string-char-code-at "xa" 1)`), 97);
        });
        it('match a number → number', function () {
            assert.strictEqual(easl.evaluate(`(string-char-code-at "0" 0)`), 48);
        });
    });

    describe('string-concat', function () {
        it('one strings', function () {
            assert.strictEqual(easl.evaluate(`(string-concat "a")`), "a");
        });
        it('two chars', function () {
            assert.strictEqual(easl.evaluate(`(string-concat "a" "b")`), "ab");
        });
        it('three chars', function () {
            assert.strictEqual(easl.evaluate(`(string-concat "a" "b" "c")`), "abc");
        });
        it('eval expressions', function () {
            assert.strictEqual(easl.evaluate(`(string-concat ((lambda () "a")) (~ "b" "c"))`), "abc");
        });
    });

    describe('string-ends-with', function () {
        it('ending with', function () {
            assert.strictEqual(easl.evaluate(`(string-ends-with "hello" "lo")`), true);
        });
        it('not ending with', function () {
            assert.strictEqual(easl.evaluate(`(string-ends-with "hello" "ll")`), false);
        });
    });

    describe('string-from-char-code', function () {
        it('correct code', function () {
            assert.strictEqual(easl.evaluate(`(string-from-char-code 97)`), "a");
        });
    });

    describe('string-includes', function () {
        it('non existing substring', function () {
            assert.strictEqual(easl.evaluate(`(string-includes "hello" "la")`), false);
        });

        it('existing substring', function () {
            assert.strictEqual(easl.evaluate(`(string-includes "hello" "lo")`), true);
        });
    });

    describe('string-index-of', function () {
        it('existing string', function () {
            assert.strictEqual(easl.evaluate(`(string-index-of "hello" "ll")`), 2);
        });

        it('non existing substring', function () {
            assert.strictEqual(easl.evaluate(`(string-index-of "hello" "kk")`), -1);
        });

        it('existing string with start index', function () {
            assert.strictEqual(easl.evaluate(`(string-index-of "hello" "ll" 1)`), 2);
        });

        it('existing string with start index out of range', function () {
            assert.strictEqual(easl.evaluate(`(string-index-of "hello" "ll" 4)`), -1);
        });
    });

    describe('string-length', function () {
        it('empty string', function () {
            assert.strictEqual(easl.evaluate(`(string-length "")`), 0);
        });

        it('non empty string', function () {
            assert.strictEqual(easl.evaluate(`(string-length "hello")`), 5);
        });
    });

    describe('string-starts-with', function () {
        it('starting with', function () {
            assert.strictEqual(easl.evaluate(`(string-starts-with "hello" "hel")`), true);
        });
        it('not starting with', function () {
            assert.strictEqual(easl.evaluate(`(string-starts-with "hello" "ell")`), false);
        });
    });


    describe('string-split', function () {
        it('not a string', function () {
            assert.strictEqual(easl.evaluate(`(string-split 42)`),
                "Error: 'string-split' requires string. Given: number 42");
        });

        it('no separator', function () {
            assert.deepStrictEqual(easl.evaluate(`
                {let lst (string-split "ABC")}
                lst                                 `), ["A", "B", "C"]);
        });

        it('with separator', function () {
            assert.deepStrictEqual(easl.evaluate(`(string-split "A-B-C" "-")`), ["A", "B", "C"]);
        });
        it('new line', function () {
            assert.deepStrictEqual(easl.evaluate(`
                  (string-split "A
B
C" "\n")`                                 ), ["A", "B", "C"]);
        });
    });

    describe('string-to-lower', function () {
        it('not a string', function () {
            assert.strictEqual(easl.evaluate(`
                (string-to-lower  42)              `),
                "Error: 'string-to-lower' requires string. Given: number 42");
        });
        it('lowercase', function () {
            assert.strictEqual(easl.evaluate(`
                (string-to-lower  "hello")         `), "hello");
        });
        it('mixed case', function () {
            assert.strictEqual(easl.evaluate(`
                (string-to-lower  "Hello")         `), "hello");
        });
        it('uppercase', function () {
            assert.strictEqual(easl.evaluate(`
                (string-to-lower  "HELLO")         `), "hello");
        });
    });

    describe('string-to-upper', function () {
        it('not a string', function () {
            assert.strictEqual(easl.evaluate(`
                (string-to-upper  42)              `),
                "Error: 'string-to-upper' requires string. Given: number 42");
        });
        it('lowercase', function () {
            assert.strictEqual(easl.evaluate(`
                (string-to-upper  "hello")         `), "HELLO");
        });
        it('mixed case', function () {
            assert.strictEqual(easl.evaluate(`
                (string-to-upper  "Hello")         `), "HELLO");
        });
        it('uppercase', function () {
            assert.strictEqual(easl.evaluate(`
                (string-to-upper  "HELLO")         `), "HELLO");
        });
    });
});
