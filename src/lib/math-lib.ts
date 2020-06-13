"use strict";

class MathLib implements ILib {
    private readonly inter: Interpreter;
    private readonly methods: any = {
        "math-pi"     : this.evalMathPi,
        "math-abs"    : this.evalMathAbs,
        "math-ceil"   : this.evalMathCeil,
        "math-floor"  : this.evalMathFloor,
        "math-log"    : this.evalMathLog,
        "math-max"    : this.evalMathMax,
        "math-min"    : this.evalMathMin,
        "math-pow"    : this.evalMathPow,
        "math-random" : this.evalMathRandom,
        "math-round"  : this.evalMathRound,
        "math-sqrt"   : this.evalMathSqrt,
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

    // (math-pi)
    private evalMathPi(expr: any[], env: any[]): number {
        this.inter.evalArgs([], expr, env);

        return Math.PI;
    }

    // (math-abs num)
    private evalMathAbs(expr: any[], env: any[]): number {
        const [num] = <[number]>this.inter.evalArgs(["number"], expr, env);

        return Math.abs(num);
    }

    // (math-ceil num)
    private evalMathCeil(expr: any[], env: any[]): number {
        const [num] = <[number]>this.inter.evalArgs(["number"], expr, env);

        return Math.ceil(num);
    }

    // (math-floor num)
    private evalMathFloor(expr: any[], env: any[]): number {
        const [num] = <[number]>this.inter.evalArgs(["number"], expr, env);

        return Math.floor(num);
    }

    // (math-log num)
    private evalMathLog(expr: any[], env: any[]): number {
        const [num] = <[number]>this.inter.evalArgs(["number"], expr, env);

        return Math.log(num);
    }

    // (math-max num1 num2)
    private evalMathMax(expr: any[], env: any[]): number {
        const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

        return Math.max(num1, num2);
    }

    // (math-min num1 num2)
    private evalMathMin(expr: any[], env: any[]): number {
        const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

        return Math.min(num1, num2);
    }

    // (math-pow num1 num2)
    private evalMathPow(expr: any[], env: any[]): number {
        const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

        return Math.pow(num1, num2);
    }

    // (math-random)
    private evalMathRandom(expr: any[], env: any[]): number {
        this.inter.evalArgs([], expr, env);

        return Math.random();
    }

    // (math-round num)
    private evalMathRound(expr: any[], env: any[]): number {
        const [num] = <[number]>this.inter.evalArgs(["number"], expr, env);

        return Math.round(num);
    }

    // (math-sqrt num)
    private evalMathSqrt(expr: any[], env: any[]): number {
        const [num] = <[number]>this.inter.evalArgs(["number"], expr, env);

        return Math.sqrt(num);
    }
}
