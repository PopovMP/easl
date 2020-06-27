"use strict";

class Parser {
    private isOpenParen   = (ch: string): boolean => ["(", "[", "{"].includes(ch);
    private isCloseParen  = (ch: string): boolean => [")", "]", "}"].includes(ch);
    private isDelimiter   = (ch: string): boolean => ["(", ")", "[", "]", "{", "}", "'", "`", ","].includes(ch);
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

        const abbrevList: [string, string][] = [["'", "quote"], ["`", "quasiquote"]];

        const codeList:       any[] = this.tokenize(fixedText);

        this.checkMatchingParens(codeList);

        const abbrevResolved: any[] = this.expandAbbreviations(codeList, abbrevList);
        const pipesResolved:  any[] = this.expandPipeLeft(abbrevResolved, "<<");
        const ilTree: any[] = this.nest(pipesResolved);

        return ilTree;
    }

    private expandAbbreviations(codeList: any[], abbrevList: [string, string][]): any[] {
        if (abbrevList.length === 0) {
            return codeList;
        }

        const abbrev: [string, string] = abbrevList[0];
        const expandedSymbols: any[] = this.expandSymbolAbbreviation(codeList, abbrev[0], abbrev[1]);
        const expandedLists: any[]   = this.expandListAbbreviation(expandedSymbols, abbrev[0], abbrev[1]);
        return this.expandAbbreviations(expandedLists, abbrevList.slice(1));
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

            if ( this.isDelimiter(ch) ) {
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

    public expandSymbolAbbreviation(input: any[], abbrevChar: string, fullForm: string): any[] {
        const output: any[] = [];

        for (let i = 0; i < input.length; i++) {
            const curr: string = input[i];
            const next: string = input[i + 1];

            if (curr === abbrevChar && !this.isOpenParen(next) && next !== abbrevChar) {
                output.push("(", fullForm, next, ")");
                i++;
            } else {
                output.push(curr);
            }
        }

        return output;
    }

    public expandListAbbreviation(input: any[], abbrevChar: string, fullForm: string): any[] {
        const output: any[] = [];

        for (let i: number = 0, paren: number = 0, flag: boolean = false; i < input.length; i++) {
            const curr: string = input[i];
            const next: string = input[i + 1];

            if (!flag && curr === abbrevChar && this.isOpenParen(next)  ) {
                output.push("(", fullForm);
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
            ? this.expandListAbbreviation(output, abbrevChar, fullForm)
            : output;
    }

    public expandPipeLeft(input: any[], pipeSymbol: string): any[] {
        const output: any[] = [];

        for (let i: number = 0, paren: number = 0, pipes: number = 0; i < input.length; i++) {
            const curr: string = input[i];

            if (curr === pipeSymbol ) {
                output.push("(");
                pipes++;
                continue;
            }

            output.push(curr);

            if (pipes > 0 && this.isOpenParen(curr) ) {
                paren++;
            }

            if (pipes > 0 && paren === 0 && this.isCloseParen(curr) ) {
                for (; pipes > 0; pipes--) {
                    output.push(")");
                }
            }

            if (pipes > 0 && this.isCloseParen(curr) ) {
                paren--;
            }
        }

        return output;
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

    public checkMatchingParens(codeList: any[]): void {
        let curly  = 0;
        let square = 0;
        let round  = 0;

        for (let i: number = 0; i < codeList.length; i++) {
            // Eat string
            if (codeList[i - 1] === "(" && codeList[i] === "string") {
                i += 2;
            }

            switch (codeList[i]) {
                case "(":
                    round++;
                    break;
                case "[":
                    square++;
                    break;
                case "{":
                    curly++;
                    break;
                case ")":
                    round--;
                    break;
                case "]":
                    square--;
                    break;
                case "}":
                    curly--;
                    break;
            }
        }

        if (curly !== 0) {
            throw "Unmatching curly braces!";
        }

        if (square !== 0) {
            throw "Unmatching square braces!";
        }

        if (round !== 0) {
            throw "Unmatching round braces!";
        }
    }
}

if (typeof module === "object") {
    module.exports.Parser = Parser;
}
