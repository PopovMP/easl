"use strict";

class StringLib implements ILib {
    private readonly inter: Interpreter;
    public readonly builtinFunc = ["str.ends-with", "str.has", "str.length", "str.split", "str.starts-with",
        "str.to-lowercase", "str.to-uppercase"];
    public readonly builtinHash: any = {};

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;

        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "str.ends-with"    : return this.strEndsWith(expr, env);
            case "str.has"          : return this.strHas(expr, env);
            case "str.length"       : return this.strLength(expr, env);
            case "str.split"        : return this.strSplit(expr, env);
            case "str.starts-with"  : return this.strStartsWith(expr, env);
            case "str.to-lowercase" : return this.strToLowercase(expr, env);
            case "str.to-uppercase" : return this.strToUppercase(expr, env);
        }

        throw "Error: Not found in 'string-lib': " + expr[0];
    }

    private strLength(expr: any[], env: any): number {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string") throw Error("Not a string: " + str);
        return str.length;
    }

    private strHas(expr: any[], env: any): boolean {
        const haystack : string = this.inter.evalExpr(expr[1], env);
        const needle: string = this.inter.evalExpr(expr[2], env);
        if (typeof haystack  !== "string") throw Error("Not a string: " + haystack);
        if (typeof needle !== "string") throw Error("Not a string: " + needle);
        return haystack.indexOf(needle) > -1;
    }

    private strSplit(expr: any[], env: any): any[] {
        const str: string = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string") throw Error("Not a string: " + str);
        if (expr.length === 2) return str.split("").map(e => ["string", e]);
        const sep: string = this.inter.evalExpr(expr[2], env);
        if (typeof sep !== "string") throw Error("Not a string: " + sep);
        return str.split(sep).map(e => ["string", e]);
    }

    private strStartsWith(expr: any[], env: any): boolean {
        const haystack: string = this.inter.evalExpr(expr[1], env);
        const needle: string = this.inter.evalExpr(expr[2], env);
        if (typeof haystack !== "string") throw Error("Not a string: " + haystack);
        if (typeof needle !== "string") throw Error("Not a string: " + needle);
        return haystack.lastIndexOf(needle, 0) === 0;
    }

    private strEndsWith(expr: any[], env: any): boolean {
        const haystack: string = this.inter.evalExpr(expr[1], env);
        const needle: string = this.inter.evalExpr(expr[2], env);
        if (typeof haystack !== "string") throw Error("Not a string: " + haystack);
        if (typeof needle !== "string") throw Error("Not a string: " + needle);
        return haystack.lastIndexOf(needle) === haystack.length - needle.length;
    }

    private strToLowercase(expr: any[], env: any): string {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string") throw Error("Not a string: " + str);
        return str.toLowerCase();
    }

    private strToUppercase(expr: any[], env: any): string {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string") throw Error("Not a string: " + str);
        return str.toUpperCase();
    }
}
