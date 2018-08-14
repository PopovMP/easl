"use strict";

// Comments semicolon ;
// string - enclosed in quotation marks: "John"
// white characters: space, tab, new line, line feed: [" ", "\t", "\r", "\n"]


class Lexer {

    public static splitCode(code: string): any[] {
        const lexList: string[] = [];

        for (let i = 0, symbol = ""; i < code.length; i++) {
            const ch = code[i];

            const pushSymbol = () => {
                if (symbol === "") return;
                lexList.push(symbol);
                symbol = "";
            };

            if (Grammar.isStringEnclosureChar(ch)) {
                const charList: string[] = [];
                for (i++; i < code.length; i++) {
                    const c = code[i];
                    if (Grammar.isStringEnclosureChar(c)) {
                        const str = charList.join("");
                        lexList.push(str);
                        break;
                    } else {
                        charList.push(c);
                    }
                }
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

}

module.exports.Lexer = Lexer;
