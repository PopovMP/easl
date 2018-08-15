"use strict";

// Comments semicolon ;
// string - enclosed in quotation marks: "John"
// white characters: space, tab, new line, line feed: [" ", "\t", "\r", "\n"]


class Lexer {

    public static splitCode(code: string): any[] {
        const lexList: any[] = [];

        for (let i = 0, symbol = ""; i < code.length; i++) {
            const ch = code[i];

            const pushSymbol = () => {
                if (symbol === "") return;
                if (Grammar.isTextNumber(symbol)) {
                    const number: number = Lexer.parseNumber(symbol);
                    lexList.push(number);
                } else {
                    lexList.push(symbol);
                }
                symbol = "";
            };

            if (Grammar.isStringEnclosureChar(ch)) {
                const charList: string[] = [];
                for (i++; i < code.length; i++) {
                    const c = code[i];
                    if (Grammar.isStringEnclosureChar(c)) {
                        break;
                    } else {
                        charList.push(c);
                    }
                }
                const str = charList.join("");

                // Syntax sugar: "hello" -> (string "hello")
                lexList.push('(');
                lexList.push('string');
                lexList.push(str);
                lexList.push(')');

            } else if (Grammar.isLineComment(ch)) {
                for (; i < code.length; i++) {
                    const c = code[i];
                    if (Grammar.isEndOfLine(c)) {
                        break;
                    }
                }
            } else if (Grammar.isParen(ch)) {
                pushSymbol();
                lexList.push(ch);

                if (ch === "[") {
                    // Syntax sugar: [1 2 3] -> [list 1 2 3]
                    lexList.push("list");
                }

            } else if (Grammar.isWhiteSpace(ch)) {
                pushSymbol();
            } else {
                symbol += ch;
                if (i === code.length - 1) {
                    pushSymbol();
                }
            }
        }

        return lexList;
    }

    public static parseNumber(numberText: string): number {
        const isNegative = numberText[0] === "-";
        const cleanedNumbText = numberText.replace(/-/g, "");
        const parsedNumber = Number(cleanedNumbText);
        const number = isNegative ? -parsedNumber : parsedNumber;
        return number;
    }
}

module.exports.Lexer = Lexer;
