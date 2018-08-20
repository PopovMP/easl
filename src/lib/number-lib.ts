"use strict";

class NumberLib implements ILib {
    private readonly inter: Interpreter;

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "numb.finite?"      : return this.evalIsFine(expr, env);
            case "numb.integer?"     : return this.evalIsInteger(expr, env);
            case "numb.max-value"    : return Number.MAX_VALUE;
            case "numb.min-value"    : return Number.MIN_VALUE;
            case "numb.parse-float"  : return this.evalParseFloat(expr, env);
            case "numb.parse-int"    : return this.evalParseInt(expr, env);
            case "numb.to-fixed"     : return this.evalToFixed(expr, env);
            case "numb.to-precision" : return this.evalToPrecision(expr, env);
            case "numb.to-string"    : return this.evalToString(expr, env);
        }

        return "##not-resolved##";
    }

    private evalIsFine(expr: any[], env: any[]): boolean {
        const value: number = this.inter.evalExpr(expr[1], env);
        return typeof value === "number" && isFinite(value);
    }

    private evalIsInteger(expr: any[], env: any[]): boolean {
        const value: number = this.inter.evalExpr(expr[1], env);
        return typeof typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    }

    private evalParseFloat(expr: any[], env: any[]): number {
        const value: string = this.inter.evalExpr(expr[1], env);
        return parseFloat(value);
    }

    private evalParseInt(expr: any[], env: any[]): number {
        const value = this.inter.evalExpr(expr[1], env);
        return parseInt(value);
    }

    private evalToFixed(expr: any[], env: any[]): string {
        const value : number = this.inter.evalExpr(expr[1], env);
        const digits: number = expr[2] ? this.inter.evalExpr(expr[2], env) : 0;
        return value.toFixed(digits);
    }

    private evalToPrecision(expr: any[], env: any[]): string {
        const value    : number = this.inter.evalExpr(expr[1], env);
        const precision: number = expr[2] ? this.inter.evalExpr(expr[2], env) : 0;
        return value.toPrecision(precision);
    }

    private evalToString(expr: any[], env: any[]): string {
        const value: number = this.inter.evalExpr(expr[1], env);
        const radix: number = expr[2] ? this.inter.evalExpr(expr[2], env) : 10;
        return value.toString(radix);
    }
}
