"use strict";

const assert = require("assert");
const {describe, it} = require("@popovmp/mocha-tiny");
const {Parser, Printer} = require("../public/js/easl.js");

const parser = new Parser();

describe('Parser', function () {
    describe("tokenize expression", function () {
        it("one digit", function () {
            assert.deepStrictEqual(parser.tokenize("1"), [1]);
        });

        it("let - number", function () {
            assert.deepStrictEqual(parser.tokenize("{let n 25}"), ["{", "let", "n", 25, "}"]);
        });

        it("let - list", function () {
            assert.deepStrictEqual(parser.tokenize("{let lst (list 1 2 3)}"),
                ["{", "let", "lst", "(", "list", 1, 2, 3, ")", "}"]);
        });

        it("let - quote", function () {
            assert.deepStrictEqual(parser.tokenize("{let lst '(1 2 3)}"),
                ["{", "let", "lst", "'", "(", 1, 2, 3, ")", "}"]);
        });

        it("code in parenthesis", function () {
            assert.deepStrictEqual(parser.tokenize("(+ a b)"), ["(", "+", "a", "b", ")"]);
        });

        it("function definition", function () {
            assert.deepStrictEqual(parser.tokenize("{function max (a b) {if (> a b) a b)}}"),
                ["{", "function", "max", "(", "a", "b", ")",
                    "{", "if", "(", ">", "a", "b", ")", "a", "b", ")", "}", "}"]);
        });

        it("Multiple expr", function () {
            assert.deepStrictEqual(parser.tokenize("1 2"), [1, 2]);
        });

        it("case", function () {
            assert.deepStrictEqual(parser.tokenize(`{case "[" {(list "[") 3}}`),
                [ "{", "case", "(", "string", "[", ")", "{", "(", "list", "(", "string", "[", ")", ")", 3, "}", "}" ]);
        });
    });

    describe("tokenize strings", function () {
        it("char A", function () {
            assert.deepStrictEqual(parser.tokenize(`  "A"  `), ["(", "string", "A", ")"]);
        });
        it("char 1", function () {
            assert.deepStrictEqual(parser.tokenize(`  "1"  `), ["(", "string", "1", ")"]);
        });
        it("char [", function () {
            assert.deepStrictEqual(parser.tokenize(`  "["  `), ["(", "string", "[", ")"]);
        });
        it("char (", function () {
            assert.deepStrictEqual(parser.tokenize(`  "("  `), ["(", "string", "(", ")"]);
        });
        it("char )", function () {
            assert.deepStrictEqual(parser.tokenize(`  ")"  `), ["(", "string", ")", ")"]);
        });

        it("char ]", function () {
            assert.deepStrictEqual(parser.tokenize(`  "]"  `), ["(", "string", "]", ")"]);
        });

        it("let - string", function () {
            assert.deepStrictEqual(parser.tokenize("{let name  \"John\"}"),
                ["{", "let", "name", "(", "string", "John", ")", "}"]);
        });

        it("empty string", function () {
            assert.deepStrictEqual(parser.tokenize("(string-length \"\")"),
                ["(", "string-length", "(", "string", "", ")", ")"]);
        });

        it("two strings", function () {
            assert.deepStrictEqual(parser.tokenize("(string-concat \"Hello \" \"world!\")"),
                ["(", "string-concat", "(", "string", "Hello ", ")", "(", "string", "world!", ")", ")"]);
        });

        it("string with quotes", function () {
            assert.deepStrictEqual(parser.tokenize(`{let text "He said ""Hello World!""."}`),
                ["{", "let", "text", "(", "string", "He said \"Hello World!\".", ")", "}"]);
        });

        it("string with an empty string", function () {
            assert.deepStrictEqual(parser.tokenize(`"Empty """"?"}`),
                ['(', 'string', 'Empty ""?', ')', '}']);
        });

        it("string with only an empty string", function () {
            assert.deepStrictEqual(parser.tokenize(`""""""`),
                ['(', 'string', '""', ')']);
        });

        it("char [ in list", function () {
            assert.deepStrictEqual(parser.tokenize(`  (list "[")  `), ["(", "list", "(", "string", "[", ")", ")"]);
        });
        it("char ] in list", function () {
            assert.deepStrictEqual(parser.tokenize(`  (list "]")  `), ["(", "list", "(", "string", "]", ")", ")"]);
        });

    });

    describe("tokenize comments", function () {
        it("comment at new line", function () {
            assert.deepStrictEqual(parser.tokenize(";; me comment"), []);
        });

        it("comment after code", function () {
            assert.deepStrictEqual(parser.tokenize("{let name  \"John\"} ;; it's a name"),
                ["{", "let", "name", "(", "string", "John", ")", "}"]);
        });
    });

    describe("expand pipe left", function () {
        it("single <<", function () {
            assert.strictEqual( Printer.stringify( parser.parse("(foo << bar)") ) , "((foo (bar)))");
        });
        it("double <<", function () {
            assert.strictEqual( Printer.stringify( parser.parse("(foo << bar << baz)") ) , "((foo (bar (baz))))");
        });
    });

    describe("stringify let", function () {
        it("stringify {let a (+ 1 2)}", function () {
            assert.strictEqual(Printer.stringify( parser.parse("{let a (+ 1 2)}") ),
                "((let a (+ 1 2)))");
        });
    });

    describe('parser', function () {
        it('parse 1', function () {
            const codeText = "1";
            assert.deepStrictEqual(parser.parse(codeText), [1]);
        });
        it('parse 2', function () {
            const codeText = "1 2 a";
            assert.deepStrictEqual(parser.parse(codeText), [1, 2, "a"]);
        });
        it('parse 3 - 1', function () {
            const codeText = "(a) (b)";
            assert.deepStrictEqual(parser.parse(codeText), [["a"], ["b"]]);
        });
        it('parse two lists', function () {
            const codeText = "(list 1 2) (list 3 4)";
            assert.deepStrictEqual(parser.parse(codeText), [["list", 1, 2], ["list", 3, 4]]);
        });
        it('parse two quotes', function () {
            const codeText = "'(1 2) '(3 4)";
            assert.deepStrictEqual(parser.parse(codeText), [["quote", [1, 2]], ["quote", [3, 4]]]);
        });
        it('parse empty string', function () {
            const codeText = '(let a "")';
            assert.deepStrictEqual(parser.parse(codeText),
                [['let', 'a', ['string', '']]]);
        });
        it('parse string', function () {
            const codeText = '(let name "John")';
            assert.deepStrictEqual(parser.parse(codeText),
                [['let', 'name', ['string', 'John']]]);
        });
        it('parse bool', function () {
            const codeText = '(let var true)';
            assert.deepStrictEqual(parser.parse(codeText),
                [['let', 'var', 'true']]);
        });

        it('parse 4', function () {
            const codeText = `
                {function fac (n)
                    {if (= n 0)
                        1
                        (* (fac (- n 1))
                           n) }}
                (fac 5)
            `;

            const ilCode = [
                ["function", "fac", ["n"],
                    ["if", ["=", "n", 0],
                        1,
                        ["*", ["fac", ["-", "n", 1]],
                            "n"]]],
                ["fac", 5]
            ];

            const ilText = `((function fac (n) (if (= n 0) 1 (* (fac (- n 1)) n))) (fac 5))`;

            assert.deepStrictEqual(parser.parse(codeText), ilCode);
            assert.deepStrictEqual( Printer.stringify( parser.parse(codeText) ), ilText);
        });

        it("char [", function () {
            assert.deepStrictEqual(parser.parse(`
                  "["    `),
                [
                    ['string', "["]
                ]);
        });

        it("list of [", function () {
            assert.deepStrictEqual(parser.parse(`
                  (list "[")    `),
                [
                    ["list", ["string", "["]]
                ]);
        });

        it("case match [", function () {
            assert.deepStrictEqual(parser.parse(`
                  {case "["
                       {(list "[") 3} }`),
                [
                    ["case", ["string", "["],
                        [["list", ["string", "["]], 3] ]
                ]);
        });

    });
});
