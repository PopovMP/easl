"use strict";

class StringLib implements ILib {
    private readonly inter: Interpreter;
    private readonly methods: any = {
        "str.char-at": this.strCharAt,
        "str.char-code-at": this.strCharCodeAt,
        "str.concat": this.strConcat,
        "str.ends-with": this.strEndsWith,
        "str.from-char-code": this.strFromCharCode,
        "str.includes": this.strIncludes,
        "str.index-of": this.strIndexOf,
        "str.last-index-of": this.strLastIndexOf,
        "str.length": this.strLength,
        "str.match": this.strMatch,
        "str.repeat": this.strRepeat,
        "str.replace": this.strReplace,
        "str.split": this.strSplit,
        "str.starts-with": this.strStartsWith,
        "str.sub-string": this.strSubString,
        "str.trim": this.strTrim,
        "str.trim-left": this.strTrimLeft,
        "str.trim-right": this.strTrimRight,
        "str.to-lowercase": this.strToLowercase,
        "str.to-uppercase": this.strToUppercase,
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
        const methodName: string = expr[0];

        if (this.methods.hasOwnProperty(methodName)) {
            return this.methods[methodName].call(this, expr, env);
        }

        throw "Error: Not found in 'string-lib': " + expr[0];
    }

    // [str.char-at, str, pos]
    private strCharAt(expr: any[], env: any): string | null {
        const str: string | any = this.inter.evalExpr(expr[1], env);
        const pos: number | any = this.inter.evalExpr(expr[2], env);

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        if (typeof pos !== "number") {
            throw Error("Not a number: " + pos);
        }

        return pos >= 0 && pos < str.length
            ? str.charAt(pos)
            : null;
    }

    // [str.char-code-at, str, pos]
    private strCharCodeAt(expr: any[], env: any): number {
        const char: string | null = this.strCharAt(expr, env);

        if (typeof char !== "string") {
            throw Error("Not a character: " + char);
        }

        return char.charCodeAt(0);
    }

    // [str.concat, str1, str2, ..., strN]
    private strConcat(expr: any[], env: any): string {
        const args: any[] = this.inter.mapExprLst(expr.slice(1), env);

        const strList: string[] = args.map((e: any) => {
            return String(e);
        });

        const res: string = strList.reduce((acc: string, e: string) => {
            return acc + e;
        }, "");

        return res;
    }

    // [str.ends-with, str, search]
    private strEndsWith(expr: any[], env: any): boolean {
        const str: string | any = this.inter.evalExpr(expr[1], env);
        const search: string | any = this.inter.evalExpr(expr[2], env);

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        if (typeof search !== "string") {
            throw Error("Not a string: " + search);
        }

        return str.lastIndexOf(search) === str.length - search.length;
    }

    // [str.from-char-code, code]
    private strFromCharCode(expr: any[], env: any): string {
        const code: number | any = this.inter.evalExpr(expr[1], env);

        if (typeof code !== "number") {
            throw Error("Not a number: " + code);
        }

        return String.fromCharCode(code);
    }

    // [str.includes, str, search, start?]
    private strIncludes(expr: any[], env: any): boolean {
        const haystack: string | any = this.inter.evalExpr(expr[1], env);
        const needle: string | any = this.inter.evalExpr(expr[2], env);
        const start: number | any = expr.length === 4 ? this.inter.evalExpr(expr[3], env) : 0;

        if (typeof haystack !== "string") {
            throw Error("Not a string: " + haystack);
        }

        if (typeof needle !== "string") {
            throw Error("Not a string: " + needle);
        }

        if (typeof start !== "number") {
            throw Error("Not a number: " + start);
        }

        return haystack.includes(needle, start);
    }

    // [str.index-of, str, search, start?]
    private strIndexOf(expr: any[], env: any): number {
        const str: string | any = this.inter.evalExpr(expr[1], env);
        const search: string | any = this.inter.evalExpr(expr[2], env);
        const start: number | any = expr.length === 4 ? this.inter.evalExpr(expr[3], env) : 0;

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        if (typeof search !== "string") {
            throw Error("Not a string: " + search);
        }

        if (typeof start !== "number") {
            throw Error("Not a number: " + start);
        }

        return str.indexOf(search, start);
    }

    // [str.last-index-of, str, search, start?]
    private strLastIndexOf(expr: any[], env: any): number {
        const str: string | any = this.inter.evalExpr(expr[1], env);
        const search: string | any = this.inter.evalExpr(expr[2], env);
        const start: number | any = expr.length === 4 ? this.inter.evalExpr(expr[3], env) : str.length;

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        if (typeof search !== "string") {
            throw Error("Not a string: " + search);
        }

        if (typeof start !== "number") {
            throw Error("Not a number: " + start);
        }

        return str.lastIndexOf(search, start);
    }

    // [str.length, str]
    private strLength(expr: any[], env: any): number {
        const str: string | any = this.inter.evalExpr(expr[1], env);

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        return str.length;
    }

    // [str.match, str, pattern, modifiers?]
    private strMatch(expr: any[], env: any): string[] | null {
        const str: string | any = this.inter.evalExpr(expr[1], env);
        const pattern: string | any = this.inter.evalExpr(expr[2], env);
        const modifiers: string | any = expr.length === 4 ? this.inter.evalExpr(expr[3], env) : "";

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        if (typeof pattern !== "string") {
            throw Error("Not a string: " + pattern);
        }

        if (typeof modifiers !== "string") {
            throw Error("Not a string: " + modifiers);
        }

        const regExp = new RegExp(pattern, modifiers);

        return str.match(regExp);
    }

    // [str.repeat, str, count]
    private strRepeat(expr: any[], env: any): string {
        const str: string | any = this.inter.evalExpr(expr[1], env);
        const count: number | any = this.inter.evalExpr(expr[2], env);

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        if (typeof count !== "number") {
            throw Error("Not a number: " + count);
        }

        return str.repeat(count);
    }

    // [str.replace, str, pattern, replace, modifiers?]
    private strReplace(expr: any[], env: any): string {
        const str: string | any = this.inter.evalExpr(expr[1], env);
        const pattern: string | any = this.inter.evalExpr(expr[2], env);
        const replace: string | any = this.inter.evalExpr(expr[3], env);
        const modifiers: string | any = expr.length === 5 ? this.inter.evalExpr(expr[4], env) : "";

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        if (typeof pattern !== "string") {
            throw Error("Not a string: " + pattern);
        }

        if (typeof replace !== "string") {
            throw Error("Not a string: " + replace);
        }

        if (typeof modifiers !== "string") {
            throw Error("Not a string: " + modifiers);
        }

        const regExp = new RegExp(pattern, modifiers);

        return str.replace(regExp, replace);
    }

    private strSplit(expr: any[], env: any): any[] {
        const str: string | any = this.inter.evalExpr(expr[1], env);

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        const sep: string | any = expr.length === 2
            ? ""
            : this.inter.evalExpr(expr[2], env);

        if (typeof sep !== "string") {
            throw Error("Not a string: " + sep);
        }

        return str.split(sep);
    }

    private strStartsWith(expr: any[], env: any): boolean {
        const haystack: string | any = this.inter.evalExpr(expr[1], env);
        const needle: string | any = this.inter.evalExpr(expr[2], env);

        if (typeof haystack !== "string") {
            throw Error("Not a string: " + haystack);
        }

        if (typeof needle !== "string") {
            throw Error("Not a string: " + needle);
        }

        return haystack.lastIndexOf(needle, 0) === 0;
    }

    // [str.sub-string, str, start, end]
    private strSubString(expr: any[], env: any): string {
        const str: string | any = this.inter.evalExpr(expr[1], env);
        const start: number | any = expr.length > 2
            ? this.inter.evalExpr(expr[2], env)
            : 0;
        const end: number | any = expr.length === 4
            ? this.inter.evalExpr(expr[3], env)
            : str.length;

        if (typeof start !== "number") {
            throw Error("Not a number: " + start);
        }

        if (typeof end !== "number") {
            throw Error("Not a number: " + end);
        }

        return str.substring(start, end);
    }

    // [str.trim, str]
    private strTrim(expr: any[], env: any): string {
        const str: string | any = this.inter.evalExpr(expr[1], env);

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        return str.trim();
    }

    // [str.trim-left, str]
    private strTrimLeft(expr: any[], env: any): string {
        const str: string | any = this.inter.evalExpr(expr[1], env);

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        return str.trimLeft();
    }

    // [str.trim-right, str]
    private strTrimRight(expr: any[], env: any): string {
        const str: string | any = this.inter.evalExpr(expr[1], env);

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        return str.trimRight();
    }

    private strToLowercase(expr: any[], env: any): string {
        const str = this.inter.evalExpr(expr[1], env);

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        return str.toLowerCase();
    }

    private strToUppercase(expr: any[], env: any): string {
        const str = this.inter.evalExpr(expr[1], env);

        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }

        return str.toUpperCase();
    }
}
