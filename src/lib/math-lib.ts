"use strict";

class MathLib implements ILib {
    private readonly app: Applicator;
    private readonly methods: any = {
        "math.pi"     : this.evalMathPi,
        "math.abs"    : this.evalMathAbs,
        "math.ceil"   : this.evalMathCeil,
        "math.floor"  : this.evalMathFloor,
        "math.log"    : this.evalMathLog,
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
        this.app = new Applicator(interpreter);

        this.builtinFunc = Object.keys(this.methods);

        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        return this.methods[expr[0]].call(this, expr, env);
    }

    private evalMathPi(expr: any[], env: any[]): number {
        return this.app.getWithNoArgs<number>(Math.PI, "math.pi", expr, env);
    }

    private evalMathAbs(expr: any[], env: any[]): number {
        return this.app.callWithNumber<number>(Math.abs, "math.abs", expr, env);
    }

    private evalMathCeil(expr: any[], env: any[]): number {
        return this.app.callWithNumber<number>(Math.ceil, "math.ceil", expr, env);
    }

    private evalMathFloor(expr: any[], env: any[]): number {
        return this.app.callWithNumber<number>(Math.floor, "math.floor", expr, env);
    }

    private evalMathLog(expr: any[], env: any[]): number {
        return this.app.callWithNumber<number>(Math.log, "math.log", expr, env);
    }

    private evalMathMax(expr: any[], env: any[]): number {
        return this.app.callWithNumberNumber<number>(Math.max, "math.max", expr, env);
    }

    private evalMathMin(expr: any[], env: any[]): number {
        return this.app.callWithNumberNumber<number>(Math.min, "math.min", expr, env);
    }

    private evalMathPow(expr: any[], env: any[]): number {
        return this.app.callWithNumberNumber<number>(Math.pow, "math.pow", expr, env);
    }

    private evalMathRandom(expr: any[], env: any[]): number {
        return this.app.callWithNoArgs<number>(Math.random, "math.random", expr, env);
    }

    private evalMathRound(expr: any[], env: any[]): number {
        return this.app.callWithNumber<number>(Math.round, "math.round", expr, env);
    }

    private evalMathSqrt(expr: any[], env: any[]): number {
        return this.app.callWithNumber<number>(Math.sqrt, "math.sqrt", expr, env);
    }
}
