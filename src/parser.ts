"use strict";

class Parser {
    private isParen       = (ch: string): boolean => this.isOpenParen(ch) || this.isCloseParen(ch);
    private isOpenParen   = (ch: string): boolean => ["(", "[", "{"].includes(ch);
    private isCloseParen  = (ch: string): boolean => [")", "]", "}"].includes(ch);
    private isQuoteAbbrev = (ch: string): boolean => ch === "'";
    private isWhiteSpace  = (ch: string): boolean => [" ", "\t", "\r", "\n"].includes(ch);
    private isLineComment = (ch: string): boolean => ch === ";";

    private isTextNumber(text: string): boolean {
        return /^[-+]?\d+(?:\.\d+)*$/.test(text);
    }


    public parse(codeText: string): any[] {
        const fixedText = codeText
            .replace(/λ/g,                    "lambda")
            .replace(/'\([ \t\r\n]*\)/g,      "(list)")
            .replace(/\(string[ \t\r\n]*\)/g, '""')
            .replace(/\\n/g,                  "\n")
            .replace(/\\t/g,                  "\t")
            .replace(/\\"/g,                  '""');

        const codeTree: any[]         = this.tokenize(fixedText);
        const expandedQSymbols: any[] = this.expandQuotedSymbol(codeTree);
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

        const lexList: any[] = [];

        const pushToken = (token: string): void => {
            if (token === "") return;
            lexList.push( this.isTextNumber(token) ? Number(token) : token );
        };

        for (let i = 0, token = ""; i < code.length; i++) {
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

                lexList.push("(", "string", chars.join(""), ")");
                continue;
            }

            // Eat line comment
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
                pushToken(token);
                token = "";
                continue;
            }

            if ( this.isParen(ch) || this.isQuoteAbbrev(ch) ) {
                pushToken(token);
                token = "";
                lexList.push(ch);
                continue;
            }

            token += ch;

            if (i === code.length - 1) {
                pushToken(token);
                token = "";
            }
        }

        return lexList;
    }

    public expandQuotedSymbol(tree: any[]): any[] {
        const tokens: any[] = [];

        for (let i = 0; i < tree.length; i++) {
            const token: string = tree[i];
            const next: string  = tree[i + 1];

            if (this.isQuoteAbbrev(token) &&
                !(this.isOpenParen(next) || this.isCloseParen(next) || this.isQuoteAbbrev(next)) ) {
                tokens.push("(", "quote", next, ")");
                i++;
            } else {
                tokens.push(token);
            }
        }

        return tokens;
    }

    public expandQuotedList(tree: any[]): any[] {
        const tokens: any[] = [];

        const getParenDelta = (index: number, depth: number) => depth > 0
            ? this.isOpenParen(tree[index])
                ? 1
                : this.isCloseParen(tree[index])
                    ? -1
                    : 0
            : 0;

        const loop = (i: number, depth: number, paren: number): void => {
            if (depth === 0 && this.isQuoteAbbrev(tree[i]) && this.isOpenParen(tree[i + 1])) {
                tokens.push("(", "quote");
                return loop(i + 1, 1, 0);
            }

            const newParen = paren + getParenDelta(i, depth);
            if (depth === 1 && newParen === 0) {
                tokens.push(tree[i]);
                tokens.push(")");
                return loop(i + 1, 0, 0);
            }

            if (i < tree.length) {
                tokens.push(tree[i]);
                return loop(i + 1, depth, newParen);
            }
        }

        loop(0, 0, 0);

        return tokens.length > tree.length
            ? this.expandQuotedList(tokens)
            : tokens;
    }

    public nest(tree: any[]): any[] {
        let i: number = -1;

        function pass(list: any[]): any[] {
            if (++i === tree.length) return list;
            const token: string = tree[i];

            if ( ["{", "[", "("].includes(token) ) {
                if (i === 0 || i > 0 && tree[i - 1] !== "string") {
                    return list.concat([pass([])]).concat(pass([]));
                }
            }

            if ( [")", "]", "}"].includes(token) ) {
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
}

if (typeof module === "object") {
    module.exports.Parser = Parser;
}
