"use strict";

class NumberLib implements ILib {
    private readonly inter: Interpreter;
    public readonly builtinFunc = ["numb.max-value", "numb.min-value", "numb.parse-float", "numb.parse-int",
        "numb.is-finite", "numb.is-integer", "numb.to-fixed", "numb.to-string"];
    public readonly builtinHash: any = {};

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;

        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "numb.max-value"   : return Number.MAX_VALUE;
            case "numb.min-value"   : return Number.MIN_VALUE;
            case "numb.parse-float" : return this.evalParseFloat(expr, env);
            case "numb.parse-int"   : return this.evalParseInt(expr, env);
            case "numb.is-finite"   : return this.evalIsFinite(expr, env);
            case "numb.is-integer"  : return this.evalIsInteger(expr, env);
            case "numb.to-fixed"    : return this.evalToFixed(expr, env);
            case "numb.to-string"   : return this.evalToString(expr, env);
        }

        throw "Error: Not found in 'numb-lib': " + expr[0];
    }

    private evalParseFloat(expr: any[], env: any[]): number {
        const value: string = this.inter.evalExpr(expr[1], env);
        const res: number = parseFloat(value);
        if (isNaN(res)) throw "Error: Not a number: " + value;
        return res;
    }

    private evalParseInt(expr: any[], env: any[]): number {
        const value = this.inter.evalExpr(expr[1], env);
        const res: number = parseInt(value);
        if (isNaN(res)) throw "Error: Not a number: " + value;
        return res;
    }

    private evalIsFinite(expr: any[], env: any[]): boolean {
        const value: number = this.inter.evalExpr(expr[1], env);
        return typeof value === "number" && isFinite(value);
    }

    private evalIsInteger(expr: any[], env: any[]): boolean {
        const value: number = this.inter.evalExpr(expr[1], env);
        return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    }

    private evalToFixed(expr: any[], env: any[]): string {
        const value : number = this.inter.evalExpr(expr[1], env);
        const digits: number = expr[2] ? this.inter.evalExpr(expr[2], env) : 0;
        return value.toFixed(digits);
    }

    private evalToString(expr: any[], env: any[]): string {
        const value: number = this.inter.evalExpr(expr[1], env);
        return value.toString();
    }
}
