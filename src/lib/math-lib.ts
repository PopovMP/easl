"use strict";

class MathLib implements ILib {
    private readonly inter: Interpreter;
    private readonly methods: any = {
        "math.pi"     : this.evalMathPi,
        "math.abs"    : this.evalMathAbs,
        "math.ceil"   : this.evalMathCeil,
        "math.floor"  : this.evalMathFloor,
        "math.log"    : this.evalMathLog,
        "math.ln"     : this.evalMathLn,
        "math.max"    : this.evalMathMax,
        "math.min"    : this.evalMathMin,
        "math.pow"    : this.evalMathPow,
        "math.random" : this.evalMathRandom,
        "math.round"  : this.evalMathRound,
        "math.sqrt"   : this.evalMathSqrt,
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

    private getNumber(proc: string, expr: any[], env: any[]): number {
        if (expr.length !== 2) {
            throw `Error: '${proc}' requires 1 argument. Given: ${expr.length - 1}`;
        }

        const n: number | any = this.inter.evalExpr(expr[1], env);

        if (typeof n !== "number") {
            throw `Error: '${proc}' requires a number. Given: ${n}`;
        }

        return n;
    }

    private getNumberNumber(proc: string, expr: any[], env: any[]): number[] {
        if (expr.length !== 3) {
            throw `Error: '${proc}' requires 2 arguments. Given: ${expr.length - 1}`;
        }

        const m: number | any = this.inter.evalExpr(expr[1], env);
        const n: number | any = this.inter.evalExpr(expr[2], env);

        if (typeof m !== "number" || typeof n !== "number") {
            throw `Error: '${proc}' requires two numbers. Given: ${m}, ${n}`;
        }

        return [m, n];
    }

    private evalMathPi(expr: any[]): number {
        if (expr.length !== 1) {
            throw `Error: 'math.pi' requires 0 arguments. Given: ${expr.length - 1}`;
        }

        return Math.PI;
    }

    private evalMathAbs(expr: any[], env: any[]): number {
        return Math.abs( this.getNumber("math.abs", expr, env) );
    }

    private evalMathCeil(expr: any[], env: any[]): number {
        return Math.ceil( this.getNumber("math.ceil", expr, env) );
    }

    private evalMathFloor(expr: any[], env: any[]): number {
        return Math.floor( this.getNumber("math.floor", expr, env) );
    }

    private evalMathLog(expr: any[], env: any[]): number {
        return Math.log( this.getNumber("math.log", expr, env) ) * Math.LOG10E;
    }

    private evalMathLn(expr: any[], env: any[]): number {
        return Math.log( this.getNumber("math.ln", expr, env) );
    }

    private evalMathMax(expr: any[], env: any[]): number {
        const [m, n] = this.getNumberNumber("math.max", expr, env);

        return Math.max(m, n);
    }

    private evalMathMin(expr: any[], env: any[]): number {
        const [m, n] = this.getNumberNumber("math.min", expr, env);

        return Math.min(m, n);
    }

    private evalMathPow(expr: any[], env: any[]): number {
        const [m, n] = this.getNumberNumber("math.pow", expr, env);

        return Math.pow(m, n);
    }

    private evalMathRandom(expr: any[]): number {
        if (expr.length !== 1) {
            throw `Error: 'math.random' requires 0 arguments. Given: ${expr.length - 1}`;
        }

        return Math.random();
    }

    private evalMathRound(expr: any[], env: any[]): number {
        return Math.round( this.getNumber("math.round", expr, env) );
    }

    private evalMathSqrt(expr: any[], env: any[]): number {
        return Math.round( this.getNumber("math.sqrt", expr, env) );
    }
}
