"use strict";

class Parser {
    private isParen       = (ch: string): boolean => this.isOpenParen(ch) || this.isCloseParen(ch);
    private isOpenParen   = (ch: string): boolean => ["(", "[", "{"].includes(ch);
    private isCloseParen  = (ch: string): boolean => [")", "]", "}"].includes(ch);
    private isQuoteAbbrev = (ch: string): boolean => ch === "'";
    private isWhiteSpace  = (ch: string): boolean => [" ", "\t", "\r", "\n"].includes(ch);
    private isLineComment = (ch: string): boolean => ch === ";";
    private isTextNumber  = (tx: string): boolean => /^[-+]?\d+(?:\.\d+)*$/.test(tx);

    public parse(codeText: string): any[] {
        const fixedText = codeText
            .replace(/λ/g,                    "lambda")
            .replace(/'\([ \t\r\n]*\)/g,      "(list)")
            .replace(/\(string[ \t\r\n]*\)/g, '""')
            .replace(/\\n/g,                  "\n")
            .replace(/\\t/g,                  "\t")
            .replace(/\\"/g,                  '""');

        const codeList: any[]         = this.tokenize(fixedText);
        const expandedQSymbols: any[] = this.expandQuotedSymbol(codeList);
        const expandedQLists: any[]   = this.expandQuotedList(expandedQSymbols);
        const ilTree: any[]           = this.nest(expandedQLists);

        return ilTree;
    }

    public tokenize(code: string): any[] {
        const isInFile            = (i: number): boolean => i < code.length;
        const isInLine            = (i: number): boolean => code[i] !== "\n" && code[i] !== undefined;
        const isOpenRangeComment  = (i: number): boolean => code[i] + code[i + 1] === "#|";
        const isCloseRangeComment = (i: number): boolean => code[i - 1] + code[i] === "|#";
        const isStringChar        = (ch: string): boolean => ch === "\"";

        const output: any[] = [];

        const pushLexeme = (lexeme: string): void => {
            if (lexeme === "") return;
            output.push( this.isTextNumber(lexeme) ? Number(lexeme) : lexeme );
        };

        for (let i = 0, lexeme = ""; i < code.length; i++) {
            const ch = code[i];

            // Detect a string and bound it in (string str)
            if ( isStringChar(ch) ) {
                const chars: string[] = [];

                for (i++; isInFile(i); i++) {
                    if ( isStringChar(code[i]) ) {
                        if ( isStringChar(code[i + 1]) ) {
                            chars.push('"');
                            i++;
                            continue;
                        }

                        break;
                    }

                    chars.push(code[i]);
                }

                output.push("(", "string", chars.join(""), ")");
                continue;
            }

            // Eat line comment ; ...
            if ( this.isLineComment(ch) ) {
                do { i++ } while ( isInFile(i) && isInLine(i) );
                continue;
            }

            // Eat range comment #| ... |#
            if ( isOpenRangeComment(i) ) {
                do { i++ } while ( !isCloseRangeComment(i) );
                continue;
            }

            if ( this.isWhiteSpace(ch) ) {
                pushLexeme(lexeme);
                lexeme = "";
                continue;
            }

            if ( this.isParen(ch) || this.isQuoteAbbrev(ch) ) {
                pushLexeme(lexeme);
                lexeme = "";
                output.push(ch);
                continue;
            }

            lexeme += ch;

            if (i === code.length - 1) {
                pushLexeme(lexeme);
                lexeme = "";
            }
        }

        return output;
    }

    public expandQuotedSymbol(input: any[]): any[] {
        const output: any[] = [];

        for (let i = 0; i < input.length; i++) {
            const curr: string = input[i];
            const next: string = input[i + 1];

            if (this.isQuoteAbbrev(curr) && !this.isOpenParen(next) && !this.isQuoteAbbrev(next) ) {
                output.push("(", "quote", next, ")");
                i++;
            } else {
                output.push(curr);
            }
        }

        return output;
    }

    public expandQuotedList(input: any[]): any[] {
        const output: any[] = [];

        for (let i: number = 0, paren: number = 0, flag: boolean = false; i < input.length; i++) {
            const curr: string = input[i];
            const next: string = input[i + 1];

            if (!flag && this.isQuoteAbbrev(curr) && this.isOpenParen(next)  ) {
                output.push("(", "quote");
                flag = true;
                continue;
            }

            output.push(curr);

            if (flag && this.isOpenParen(curr) ) {
                paren++;
            }

            if (flag && this.isCloseParen(curr) ) {
                paren--;
            }

            if (flag && paren === 0) {
                output.push(")");
                flag = false;
            }
        }

        return output.length > input.length
            ? this.expandQuotedList(output)
            : output;
    }

    public nest(input: any[]): any[] {
        let i: number = -1;

        function pass(list: any[]): any[] {
            if (++i === input.length) {
                return list;
            }

            const curr: string = input[i];
            const prev: string = input[i - 1];

            if ( ["{", "[", "("].includes(curr) && prev !== "string") {
                return list.concat([pass([])]).concat(pass([]));
            }

            if ( [")", "]", "}"].includes(curr) ) {
                if (prev === "string" && input[i - 2] !== "(" || prev !== "string") {
                    return list;
                }
            }

            return pass(list.concat(curr));
        }

        return pass([]);
    }
}

if (typeof module === "object") {
    module.exports.Parser = Parser;
}
