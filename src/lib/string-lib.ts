"use strict";

class StringLib implements ILib {
    private readonly inter: Interpreter;
    public readonly builtinFunc = ["str.length", "str.has?", "str.split", "str.to-lowercase", "str.to-uppercase"];
    public readonly builtinHash: any = {};

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;

        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "str.length" : return this.strLength(expr, env);
            case "str.has?"   : return this.strHas(expr, env);
            case "str.split"  : return this.strSplit(expr, env);
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
        const str : string = this.inter.evalExpr(expr[1], env);
        const elem: string = this.inter.evalExpr(expr[2], env);
        if (typeof str  !== "string") throw Error("Not a string: " + str);
        if (typeof elem !== "string") throw Error("Not a string: " + elem);
        return str.includes(elem);
    }

    private strSplit(expr: any[], env: any): string[] {
        const str: string = this.inter.evalExpr(expr[1], env);
        if (typeof str  !== "string") throw Error("Not a string: " + str);
        if (expr.length === 2) return str.split("");
        const sep: string = this.inter.evalExpr(expr[2], env);
        if (typeof sep  !== "string") throw Error("Not a string: " + sep);
        return str.split(sep);
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
