"use strict";

class NumberLib implements ILib {
    private readonly inter: Interpreter;
    private readonly methods: any = {
        "numb.max-int"     : this.evalMaxInt,
        "numb.min-int"     : this.evalMinInt,
        "numb.parse-float" : this.evalParseFloat,
        "numb.parse-int"   : this.evalParseInt,
        "numb.is-finite"   : this.evalIsFinite,
        "numb.is-integer"  : this.evalIsInteger,
        "numb.to-fixed"    : this.evalToFixed,
        "numb.to-string"   : this.evalToString,
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

    private evalMaxInt(): number {
        return Number.MAX_SAFE_INTEGER;
    }

    private evalMinInt(): number {
        return Number.MIN_SAFE_INTEGER;
    }

    private evalParseFloat(expr: any[], env: any[]): number {
        const value: string = this.inter.evalExpr(expr[1], env);
        const res: number   = parseFloat(value);
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
        const value: number | any = this.inter.evalExpr(expr[1], env);
        return typeof value === "number" && isFinite(value);
    }

    private evalIsInteger(expr: any[], env: any[]): boolean {
        const value: number | any = this.inter.evalExpr(expr[1], env);
        return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
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
