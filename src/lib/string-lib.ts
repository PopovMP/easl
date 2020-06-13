"use strict";

class StringLib implements ILib {
    private readonly inter: Interpreter;
    private readonly methods: any = {
        "string-char-at"       : this.strCharAt,
        "string-char-code-at"  : this.strCharCodeAt,
        "string-concat"        : this.strConcat,
        "string-ends-with"     : this.strEndsWith,
        "string-from-char-code": this.strFromCharCode,
        "string-includes"      : this.strIncludes,
        "string-index-of"      : this.strIndexOf,
        "string-last-index-of" : this.strLastIndexOf,
        "string-length"        : this.strLength,
        "string-match"         : this.strMatch,
        "string-repeat"        : this.strRepeat,
        "string-replace"       : this.strReplace,
        "string-split"         : this.strSplit,
        "string-starts-with"   : this.strStartsWith,
        "string-sub-string"    : this.strSubString,
        "string-trim"          : this.strTrim,
        "string-trim-left"     : this.strTrimLeft,
        "string-trim-right"    : this.strTrimRight,
        "string-to-lower"      : this.strToLower,
        "string-to-upper"      : this.strToUpper,
    };

    public readonly builtinFunc: string[];
    public readonly builtinHash: any = {};

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;

        this.builtinFunc = Object.keys(this.methods);

        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        return this.methods[expr[0]].call(this, expr, env);
    }

    // (string-char-at str pos)
    private strCharAt(expr: any[], env: any): string {
        const [str, pos] = <[string, number]>this.inter.evalArgs(["string", "number"], expr, env);

        return str.charAt(pos);
    }

    // (string-char-code-at str index)
    private strCharCodeAt(expr: any[], env: any): number {
        const [str, index] = <[string, number]>this.inter.evalArgs(["string", "number"], expr, env);

        const code: number = str.charCodeAt(index);

        if ( isNaN(code) ) {
            throw `Error: 'string-char-code-at' index out of range.`;
        }

        return code;
    }

    // (string-concat str1 str2 ...)
    private strConcat(expr: any[], env: any): string {
        return this.inter.mapExprList( expr.slice(1), env )
            .map( Printer.stringify )
            .reduce( (acc: string, e: string) => acc + e );
    }

    // (string-ends-with str search)
    private strEndsWith(expr: any[], env: any): boolean {
        const [str, search] = <[string, string]>this.inter.evalArgs(["string", "string"], expr, env);

        return str.endsWith(search);
    }

    // (string-from-char-code code)
    private strFromCharCode(expr: any[], env: any): string {
        const [code] = <[number]>this.inter.evalArgs(["number"], expr, env);

        return String.fromCharCode(code);
    }

    // (string-includes str search pos=0)
    private strIncludes(expr: any[], env: any): boolean {
        const [str, search, pos] = <[string, string, number]>
            this.inter.evalArgs(["string", "string", ["number", 0]], expr, env);

        return str.includes(search, pos);
    }

    // (string-index-of str search pos=0)
    private strIndexOf(expr: any[], env: any): number {
        const [str, search, pos] = <[string, string, number]>
            this.inter.evalArgs(["string", "string", ["number", 0]], expr, env);

        return str.indexOf(search, pos);
    }

    // (string-last-index-of str search pos=0)
    private strLastIndexOf(expr: any[], env: any): number {
        const [str, search, pos] = <[string, string, number]>
            this.inter.evalArgs(["string", "string", ["number", 0]], expr, env);

        return str.lastIndexOf(search, pos);
    }

    // (string-length str)
    private strLength(expr: any[], env: any): number {
        const [str] = this.inter.evalArgs(["string"], expr, env);

        return str.length;
    }

    // (string-match str pattern flags="")
    private strMatch(expr: any[], env: any): string[] | null {
        const [str, pattern, flags] = <[string, string, string]>
            this.inter.evalArgs(["string", "string", ["string", ""]], expr, env);

        const regExp = new RegExp(pattern, flags);

        return str.match(regExp);
    }

    // (string-repeat str count)
    private strRepeat(expr: any[], env: any): string {
        const [str, count] = <[string, number]>this.inter.evalArgs(["string", "number"], expr, env);

        return str.repeat(count);
    }

    // (string-replace str pattern replace flags="")
    private strReplace(expr: any[], env: any): string {
        const [str, pattern, replace, flags] = <[string, string, string, string]>
            this.inter.evalArgs(["string", "string", "string", ["string", ""]], expr, env);

        const regExp = new RegExp(pattern, flags);

        return str.replace(regExp, replace);
    }

    // (string-split str sep="")
    private strSplit(expr: any[], env: any): any[] {
        const [str, sep] = <[string, string]>this.inter.evalArgs(["string", ["string", ""]], expr, env);

        return str.split(sep);
    }

    // (string-starts-with str search)
    private strStartsWith(expr: any[], env: any): boolean {
        const [str, search] = <[string ,string]>this.inter.evalArgs(["string", "string"], expr, env);

        return str.startsWith(search);
    }

    // (string-sub-string str start end)
    private strSubString(expr: any[], env: any): string {
        const [str, start, end] = <[string, number, number]>
            this.inter.evalArgs(["string", "number", ["number", 0]], expr, env);

        return str.substring(start, end);
    }

    // (string-trim str)
    private strTrim(expr: any[], env: any): string {
        const [str] = <[string]>this.inter.evalArgs(["string"], expr, env);

        return str.trim();
    }

    // (string-trim-left str)
    private strTrimLeft(expr: any[], env: any): string {
        const [str] = <[string]>this.inter.evalArgs(["string"], expr, env);

        return str.trimLeft();
    }

    // (string-trim-right str)
    private strTrimRight(expr: any[], env: any): string {
        const [str] = <[string]>this.inter.evalArgs(["string"], expr, env);

        return str.trimRight();
    }

    // (string-to-lower str)
    private strToLower(expr: any[], env: any): string {
        const [str] = <[string]>this.inter.evalArgs(["string"], expr, env);

        return str.toLowerCase();
    }

    // (string-to-upper str)
    private strToUpper(expr: any[], env: any): string {
        const [str] = <[string]>this.inter.evalArgs(["string"], expr, env);

        return str.toUpperCase();
    }
}
