"use strict";

class Parser {

    public static parse(codeText: string): any[] {

        const lexTree = Lexer.splitCode(codeText);
        const quotedLexTree = Parser.quoteSymbols(lexTree);
        const fixedLexTree = Parser.replaceParens(quotedLexTree);
        const joinedLexTree = Parser.joinLexTree(fixedLexTree);
        const codeTree = Parser.tokenize(joinedLexTree);

        return codeTree;
    }

    private static quoteSymbols(lexTree: any[]): any[] {
        const result: any[] = [];

        for (let i = 0; i < lexTree.length; i++) {
            const token = lexTree[i];
            if (Grammar.isNumber(token)) {
                result.push(token);
            } else if (Grammar.isParen(token)) {
                result.push(token);
            } else {
                result.push("\"" + token + "\"");
            }
        }

        return result;
    }

    private static replaceParens(lexTree: any[]): any[] {
        const result: any[] = [];

        for (let i = 0; i < lexTree.length; i++) {
            const token = lexTree[i];
            switch (token) {
                case "(":
                case "{":
                    result.push("[");
                    break;
                case ")":
                case "}":
                    result.push("]");
                    break;
                default:
                    result.push(token);
            }
        }

        return result;
    }

    private static joinLexTree(lexTree: any[]): string {
        const result = [];

        for (let i = 0; i < lexTree.length; i++) {
            if (lexTree[i] === "[") {
                let parens = "";
                for (; lexTree[i] === "["; i++) {
                    parens += lexTree[i];
                }
                result.push(parens += lexTree[i]);
            } else if (lexTree[i] === "]") {
                let parens = "";
                for (; lexTree[i] === "]"; i++) {
                    parens += lexTree[i];
                }
                result[result.length - 1] += parens;
                i--;
            } else {
                result.push(lexTree[i]);
            }
        }

        return result.join(",");
    }

    private static tokenize(lexText: string): any[] {
        const fixedTree = "[" + lexText + "]";
        const codeTree = JSON.parse(fixedTree);
        return codeTree;
    }
}

module.exports.Parser = Parser;
