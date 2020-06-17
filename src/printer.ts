"use strict";

class Printer {
    public static stringify(input: any[] | any): string {
        const texts:string[] = [];
        const isOpenParen    = (c: string) => ["{", "[", "("].includes(c);
        const isQuoteAbbrev  = (c: string) => c === "'";
        const lastChar       = () => texts[texts.length - 1][texts[texts.length - 1].length - 1];
        const space          = () => texts[texts.length - 1].length === 0 ||
                                     isOpenParen(   lastChar() )          ||
                                     isQuoteAbbrev( lastChar() )
                                         ? ""
                                         : " ";

        function printClosure(closure: any[]): void {
            texts.push("lambda (");
            loop(closure[1]);
            texts.push(")");
            loop(closure[2]);
        }

        function printQuote(obj: any[] | any): void {
            if ( Array.isArray(obj) ) {
                texts.push( space() + "'(" );
                loop(obj);
                texts.push(")");
            } else {
                texts.push( space() + "'" + obj );
            }
        }

        function loop(lst: any[]): void {
            if (lst.length === 0) {
                return;
            }

            const element = lst[0];

            if (element === "closure") {
                printClosure(lst);
                return;
            }

            if ( Array.isArray(element) ) {
                if (element[0] === "string") {
                    texts.push( space() + '"' + element[1] + '"' );
                }
                else if (element[0] === "quote") {
                    printQuote(element[1]);
                }
                else {
                    texts.push( space() + "(" );
                    loop(element);
                    texts.push(")");
                }
            }
            else {
                texts.push( space() + String(element) );
            }

            loop(lst.slice(1));
        }

        const type = typeof input;

        if (input === null || type === "boolean" || type === "number") {
            return String(input);
        }

        if (type === "string") {
            return input;
        }

        if ( Array.isArray(input) ) {
            if (input.length === 0) {
                return "()";
            }

            texts.push("(");
            loop(input);
            texts.push(")");

            return texts.join("");
        }

        return JSON.stringify(input);
    }
}

if (typeof module === "object") {
    module.exports.Printer = Printer;
}
