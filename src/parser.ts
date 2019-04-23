"use strict";

class Parser {
    private numberRegExp = /^[-+]?\d+(?:-\d\d\d)*(?:\.\d+)*$/;
    private openParenChars: string[] = ["(", "[", "{"];
    private closeParenChars: string[] = [")", "]", "}"];
    private whiteSpaceChars: string[] = [" ", "\t"];
    private endOfLineChars: string[] = ["\r", "\n"];
    private commentStartChars: string[] = [";"];

    public parse(codeText: string): any[] {
        const fixedText = codeText
            .replace(/λ/g, "lambda")
            .replace(/\(string\)/g, '""')
            .replace(/[{(]break[})]/g, "break")
            .replace(/[{(]continue[})]/g, "continue");
        const codeTree = this.tokenize(fixedText);
        const ilTree = this.nest(codeTree);
        return ilTree;
    }

    public tokenize(code: string): any[] {
        const lexList: any[] = [];

        const pushSymbol = (symbol: string): void => {
            if (symbol === "") return;
            if (this.isTextNumber(symbol)) {
                const number: number = this.parseNumber(symbol);
                lexList.push(number);
            } else {
                lexList.push(symbol);
            }
        };

        for (let i = 0, symbol = ""; i < code.length; i++) {
            const ch = code[i];

            if (ch === '"') {
                const charList: string[] = [];
                for (i++; i < code.length; i++) {
                    const c = code[i];
                    if (c === '"') {
                        if (i < code.length - 1 && code[i + 1] === '"') {
                            charList.push('"');
                            i++;
                            continue;
                        }
                        break;
                    }
                    charList.push(c);
                }
                const str = charList.join("");
                lexList.push("(", "string", str, ")");
                continue;
            }

            if (this.isLineComment(ch)) {
                for (; i < code.length; i++) {
                    const c = code[i];
                    if (this.isEndOfLine(c)) {
                        break;
                    }
                }
                continue;
            }

            if (this.isParen(ch)) {
                pushSymbol(symbol);
                symbol = "";
                lexList.push(ch);

                if (ch === "[") {
                    lexList.push("list"); // [1 2 3] -> [list 1 2 3]
                }
                continue;
            }

            if (this.isWhiteSpace(ch)) {
                pushSymbol(symbol);
                symbol = "";
                continue;
            }

            symbol += ch;
            if (i === code.length - 1) {
                pushSymbol(symbol);
                symbol = "";
            }
        }

        return lexList;
    }

    public nest(tree: any[]): any[] {
        let i: number = -1;

        function pass(list: any[]): any[] {
            if (++i === tree.length) return list;
            const token: string = tree[i];

            if (["{", "[", "("].indexOf(token) > -1) {
                if (i === 0 || i > 0 && tree[i - 1] !== "string") {
                    return list.concat([pass([])]).concat(pass([]));
                }
            }

            if ([")", "]", "}"].indexOf(token) > -1) {
                if (i === 0 ||
                    (i > 1 && tree[i - 1] === "string" && tree[i - 2] !== "(") ||
                    (i > 0 && tree[i - 1] !== "string")) {
                    return list;
                }
            }

            return pass(list.concat(token));
        }

        return pass([]);
    }

    private isParen(ch: string): boolean {
        return this.isOpenParen(ch) || this.isCloseParen(ch);
    }

    private isOpenParen(ch: string): boolean {
        return this.openParenChars.indexOf(ch) > -1;
    }

    private isCloseParen(ch: string): boolean {
        return this.closeParenChars.indexOf(ch) > -1;
    }

    private isWhiteSpace(ch: string): boolean {
        return this.whiteSpaceChars.indexOf(ch) > -1 ||
            this.endOfLineChars.indexOf(ch) > -1;
    }

    private isLineComment(ch: string): boolean {
        return this.commentStartChars.indexOf(ch) > -1;
    }

    private isEndOfLine(ch: string): boolean {
        return this.endOfLineChars.indexOf(ch) > -1;
    }

    private isTextNumber(text: string): boolean {
        return this.numberRegExp.test(text);
    }

    private parseNumber(numberText: string): number {
        const isNegative = numberText[0] === "-";
        const cleanedNumbText = numberText.replace(/-/g, "");
        const parsedNumber = Number(cleanedNumbText);
        const number = isNegative ? -parsedNumber : parsedNumber;
        return number;
    }
}

if (typeof module === "object") {
    module.exports.Parser = Parser;
}
