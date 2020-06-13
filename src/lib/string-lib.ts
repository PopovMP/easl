"use strict";

class StringLib implements ILib {
    private readonly inter: Interpreter;
    private readonly methods: any = {
        "str-char-at"       : this.strCharAt,
        "str-char-code-at"  : this.strCharCodeAt,
        "str-concat"        : this.strConcat,
        "str-ends-with"     : this.strEndsWith,
        "str-from-char-code": this.strFromCharCode,
        "str-includes"      : this.strIncludes,
        "str-index-of"      : this.strIndexOf,
        "str-last-index-of" : this.strLastIndexOf,
        "str-length"        : this.strLength,
        "str-match"         : this.strMatch,
        "str-repeat"        : this.strRepeat,
        "str-replace"       : this.strReplace,
        "str-split"         : this.strSplit,
        "str-starts-with"   : this.strStartsWith,
        "str-sub-string"    : this.strSubString,
        "str-trim"          : this.strTrim,
        "str-trim-left"     : this.strTrimLeft,
        "str-trim-right"    : this.strTrimRight,
        "str-to-lowercase"  : this.strToLowercase,
        "str-to-uppercase"  : this.strToUppercase,
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

    // (str.char-at str pos)
    private strCharAt(expr: any[], env: any): string {
        const [str, pos] = <[string, number]>this.inter.evalArgs(["string", "number"], expr, env);

        return str.charAt(pos);
    }

    // (str.char-code-at str index)
    private strCharCodeAt(expr: any[], env: any): number {
        const [str, index] = <[string, number]>this.inter.evalArgs(["string", "number"], expr, env);

        const code: number = str.charCodeAt(index);

        if ( isNaN(code) ) {
            throw `Error: 'str-char-code-at' index out of range.`;
        }

        return code;
    }

    // (str.concat str1 str2 ...)
    private strConcat(expr: any[], env: any): string {
        return this.inter.mapExprList( expr.slice(1), env )
            .map( Printer.stringify )
            .reduce( (acc: string, e: string) => acc + e );
    }

    // (str.ends-with str search)
    private strEndsWith(expr: any[], env: any): boolean {
        const [str, search] = <[string, string]>this.inter.evalArgs(["string", "string"], expr, env);

        return str.endsWith(search);
    }

    // (str.from-char-code code)
    private strFromCharCode(expr: any[], env: any): string {
        const [code] = <[number]>this.inter.evalArgs(["number"], expr, env);

        return String.fromCharCode(code);
    }

    // (str.includes str search pos=0)
    private strIncludes(expr: any[], env: any): boolean {
        const [str, search, pos] = <[string, string, number]>
            this.inter.evalArgs(["string", "string", ["number", 0]], expr, env);

        return str.includes(search, pos);
    }

    // (str.index-of str search pos=0)
    private strIndexOf(expr: any[], env: any): number {
        const [str, search, pos] = <[string, string, number]>
            this.inter.evalArgs(["string", "string", ["number", 0]], expr, env);

        return str.indexOf(search, pos);
    }

    // (str.last-index-of str search pos=0)
    private strLastIndexOf(expr: any[], env: any): number {
        const [str, search, pos] = <[string, string, number]>
            this.inter.evalArgs(["string", "string", ["number", 0]], expr, env);

        return str.lastIndexOf(search, pos);
    }

    // (str.length str)
    private strLength(expr: any[], env: any): number {
        const [str] = this.inter.evalArgs(["string"], expr, env);

        return str.length;
    }

    // (str.match str pattern flags="")
    private strMatch(expr: any[], env: any): string[] | null {
        const [str, pattern, flags] = <[string, string, string]>
            this.inter.evalArgs(["string", "string", ["string", ""]], expr, env);

        const regExp = new RegExp(pattern, flags);

        return str.match(regExp);
    }

    // (str.repeat str count)
    private strRepeat(expr: any[], env: any): string {
        const [str, count] = <[string, number]>this.inter.evalArgs(["string", "number"], expr, env);

        return str.repeat(count);
    }

    // (str.replace str pattern replace flags="")
    private strReplace(expr: any[], env: any): string {
        const [str, pattern, replace, flags] = <[string, string, string, string]>
            this.inter.evalArgs(["string", "string", "string", ["string", ""]], expr, env);

        const regExp = new RegExp(pattern, flags);

        return str.replace(regExp, replace);
    }

    // (str.split str sep="")
    private strSplit(expr: any[], env: any): any[] {
        const [str, sep] = <[string, string]>this.inter.evalArgs(["string", ["string", ""]], expr, env);

        return str.split(sep);
    }

    // (str.starts-with str search)
    private strStartsWith(expr: any[], env: any): boolean {
        const [str, search] = <[string ,string]>this.inter.evalArgs(["string", "string"], expr, env);

        return str.startsWith(search);
    }

    // (str.sub-string str start end)
    private strSubString(expr: any[], env: any): string {
        const [str, start, end] = <[string, number, number]>
            this.inter.evalArgs(["string", "number", ["number", 0]], expr, env);

        return str.substring(start, end);
    }

    // (str.trim str)
    private strTrim(expr: any[], env: any): string {
        const [str] = <[string]>this.inter.evalArgs(["string"], expr, env);

        return str.trim();
    }

    // (str.trim-left str)
    private strTrimLeft(expr: any[], env: any): string {
        const [str] = <[string]>this.inter.evalArgs(["string"], expr, env);

        return str.trimLeft();
    }

    // (str.trim-right str)
    private strTrimRight(expr: any[], env: any): string {
        const [str] = <[string]>this.inter.evalArgs(["string"], expr, env);

        return str.trimRight();
    }

    // (str.to-lowercase str)
    private strToLowercase(expr: any[], env: any): string {
        const [str] = <[string]>this.inter.evalArgs(["string"], expr, env);

        return str.toLowerCase();
    }

    // (str.to-uppercase str)
    private strToUppercase(expr: any[], env: any): string {
        const [str] = <[string]>this.inter.evalArgs(["string"], expr, env);

        return str.toUpperCase();
    }
}
