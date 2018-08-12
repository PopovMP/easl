"use strict";

class Parser {

    public static parse(codeText: string): any[] {

        const lexTree = Parser.lexer(codeText);
        const quotedLexTree = Parser.quoteSymbols(lexTree);
        const fixedLexTree = Parser.replaceParens(quotedLexTree);
        const joinedLexTree = Parser.joinLexTree(fixedLexTree);
        const codeTree = Parser.tokenize(joinedLexTree);

        return codeTree;
    }

    private static lexer(code: string): any[] {
        const lexList: any[] = [];

        for (let i = 0, symbol = ""; i < code.length; i++) {
            const c = code[i];

            const pushSymbol = () => {
                if (symbol === "") return;
                lexList.push(symbol);
                symbol = "";
            };

            if (Parser.isDelimiter(c)) {
                pushSymbol();
                lexList.push(c);
            } else if (Parser.isWhiteSpace(c)) {
                pushSymbol();
            } else {
                symbol += c;
                if (i === code.length - 1) {
                    pushSymbol();
                }
            }
        }

        return lexList;
    }


    private static quoteSymbols(lexTree: any[]): any[] {
        const result: any[] = [];

        for (let i = 0; i < lexTree.length; i++) {
            const token = lexTree[i];
            if (Parser.isNumber(token)) {
                result.push(token);
            } else if (Parser.isDelimiter(token)) {
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
                    result.push("[");
                    break;

                case "[":
                    result.push("[");
                    result.push("\"list\"");
                    break;

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
                for (; i < lexTree.length && lexTree[i] === "["; i++) {
                    parens += lexTree[i];
                }
                result.push(parens += lexTree[i]);
            } else if (lexTree[i] === "]") {
                let parens = "";
                for (; i < lexTree.length && lexTree[i] === "]"; i++) {
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
        // const fixedTree = lexText[0] === "[" ? lexText : "[" + lexText + "]";
        const fixedTree = "[" + lexText + "]";
        const codeTree = JSON.parse(fixedTree);
        return codeTree;
    }

    private static isDelimiter(ch: string): boolean {
        return Parser.isOpenDelimiter(ch) || Parser.isCloseDelimiter(ch);
    }

    private static isOpenDelimiter(ch: string): boolean {
        return ["(", "[", "{"].indexOf(ch) > -1;
    }

    private static isCloseDelimiter(ch: string): boolean {
        return [")", "]", "}"].indexOf(ch) > -1;
    }

    private static isDigit(ch: string): boolean {
        return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(ch) > -1;
    }

    private static isWhiteSpace(ch: string): boolean {
        return [" ", "\t", "\r", "\n"].indexOf(ch) > -1;
    }

    private static isNumber(text: string): boolean {
        if (text === "") return false;

        if (!Parser.isDigit(text[0]) && text[0] !== "-") return false;
        if (text[0] === "-" && text.length === 1) return false;

        for (let i = 1; i < text.length; i++) {
            if (!Parser.isDigit(text[i]) && text[i] !== ".") return false;
        }

        return true;
    }
}

module.exports.Parser = Parser;
