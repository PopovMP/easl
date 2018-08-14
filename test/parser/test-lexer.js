"use strict";

const assert = require("assert");
const Lexer = require("../../bin/easl.js").Lexer;

describe("Lexer", function () {
    describe("lex code", function () {
        it("one digit", function () {
            assert.deepStrictEqual(Lexer.splitCode("1"), ["1"]);
        });
        it("let - number", function () {
            assert.deepStrictEqual(Lexer.splitCode("{let n 25}"), ["{", "let", "n", "25", "}"]);
        });
        it("let - list", function () {
            assert.deepStrictEqual(Lexer.splitCode("{let lst [1 2 3]}"), ["{", "let", "lst", "[", "1", "2", "3", "]", "}"]);
        });
        it("code in parenthesis", function () {
            assert.deepStrictEqual(Lexer.splitCode("(+ a b)"), ["(", "+", "a", "b", ")"]);
        });
        it("function definition", function () {
            assert.deepStrictEqual(Lexer.splitCode("{function max [a b] {if (> a b) a b)}}"),
                ["{", "function", "max", "[", "a", "b", "]",
                    "{", "if", "(", ">", "a", "b", ")", "a", "b", ")", "}", "}"]);
        });
        it("Multiple expr", function () {
            assert.deepStrictEqual(Lexer.splitCode("1 2"), ["1", "2"]);
        });

    });

    describe("lex strings", function () {
        it("let - string", function () {
            assert.deepStrictEqual(Lexer.splitCode("{let name  \"John\"}"), ["{", "let", "name", "John", "}"]);
        });
        it("empty string", function () {
            assert.deepStrictEqual(Lexer.splitCode("(str.length \"\")"), ["(", "str.length", "", ")"]);
        });
        it("two strings", function () {
            assert.deepStrictEqual(Lexer.splitCode("(str.concat \"Hello \" \"world!\")"), ["(", "str.concat", "Hello ", "world!", ")"]);
        });
    });

    describe("lex comments", function () {
        it("comment at new line", function () {
            assert.deepStrictEqual(Lexer.splitCode(";; me comment"), []);
        });
        it("comment after code", function () {
            assert.deepStrictEqual(Lexer.splitCode("{let name  \"John\"} ;; it's a name"), ["{", "let", "name", "John", "}"]);
        });

    });
});
