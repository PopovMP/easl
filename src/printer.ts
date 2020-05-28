"use strict";

class Printer {
    public static stringify(input: any[] | any): string {
        const text:string[] = [];
        const isOpenParen  = (c: string) => ["{", "[", "("].indexOf(c) >= 0;
        const lastChar     = () => text[text.length - 1][text[text.length - 1].length - 1];
        const space        = () => text[text.length - 1].length === 0 || isOpenParen(lastChar()) ? "" : " ";

        function printClosure(closure: any[]): void {
            text.push("lambda (" + closure[1].join(" ") + ") (");

            loop(closure[2]);

            text.push(")");
        }

        function loop(lst: any[]): void {
            if (lst.length === 0) {
                text.push(")");
                return;
            }

            const element = lst[0];

            if (element === "closure") {
                printClosure(lst);
                return;
            }

            if ( Array.isArray(element) ) {

                if (element[0] === "string") {
                    text.push( space() + '"' + element[1] + '"' );
                    loop( lst.slice(1) );
                    return;
                }

                text.push( space() + "(" );
                loop(element);
            } else {
                text.push( space() + String(element) );
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

            text.push("(");

            loop(input);

            return text.join("");
        }

        return JSON.stringify(input);
    }
}

if (typeof module === "object") {
    module.exports.Printer = Printer;
}
