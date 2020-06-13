"use strict";

class NumberLib implements ILib {
    private readonly inter: Interpreter;
    private readonly methods: any = {
        "number-max-int"     : this.evalMaxInt,
        "number-min-int"     : this.evalMinInt,
        "number-parse-float" : this.evalParseFloat,
        "number-parse-int"   : this.evalParseInt,
        "number-is-finite"   : this.evalIsFinite,
        "number-is-integer"  : this.evalIsInteger,
        "number-to-fixed"    : this.evalToFixed,
        "number-to-string"   : this.evalToString,
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

    // (numb.max-int)
    private evalMaxInt(expr: any[], env: any[]): number {
        this.inter.evalArgs([], expr, env);

        return Number.MAX_SAFE_INTEGER;
    }

    // (numb.min-int)
    private evalMinInt(expr: any[], env: any[]): number {
        this.inter.evalArgs([], expr, env);

        return Number.MIN_SAFE_INTEGER;
    }

    // (numb.parse-float str)
    private evalParseFloat(expr: any[], env: any[]): number {
        const [str] = <[string]>this.inter.evalArgs(["string"], expr, env);

        const res: number = parseFloat(str);

        if ( isNaN(res) ) {
            throw "Error: 'number-parse-float' argument not a number: " + str;
        }

        return res;
    }

    // (numb.parse-int str)
    private evalParseInt(expr: any[], env: any[]): number {
        const [str] = <[string]>this.inter.evalArgs(["string"], expr, env);

        const res: number = parseInt(str);

        if ( isNaN(res) ) {
            throw "Error: 'number-parse-int' argument not a number: " + str;
        }

        return res;
    }

    // (numb.is-finite num)
    private evalIsFinite(expr: any[], env: any[]): boolean {
        const [num] = <[number]>this.inter.evalArgs(["number"], expr, env);

        return isFinite(num);
    }

    // (numb.is-integer num)
    private evalIsInteger(expr: any[], env: any[]): boolean {
        const [num] = <[number]>this.inter.evalArgs(["number"], expr, env);

        return isFinite(num) && Math.floor(num) === num;
    }

    // (numb.to-fixed num digits)
    private evalToFixed(expr: any[], env: any[]): string {
        const [num, digits] = <[number, number]>this.inter.evalArgs(["number", ["number", 0]], expr, env);

        return num.toFixed(digits);
    }

    // (numb.to-string num)
    private evalToString(expr: any[], env: any[]): string {
        const [num] = <[number]>this.inter.evalArgs(["number"], expr, env);

        return num.toString();
    }
}
