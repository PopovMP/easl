"use strict";

class MathLib implements ILib {
    private readonly inter: Interpreter;
    public readonly builtinFunc = ["math.pi","math.abs","math.ceil","math.floor","math.log","math.ln","math.max",
        "math.min", "math.pow","math.random","math.round","math.sqrt"];
    public readonly builtinHash: any = {};

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;

        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "math.pi"     : return Math.PI;
            case "math.abs"    : return Math.abs(this.inter.evalExpr(expr[1], env));
            case "math.ceil"   : return Math.ceil(this.inter.evalExpr(expr[1], env));
            case "math.floor"  : return Math.floor(this.inter.evalExpr(expr[1], env));
            case "math.log"    : return Math.log(this.inter.evalExpr(expr[1], env)) * Math.LOG10E;
            case "math.ln"     : return Math.log(this.inter.evalExpr(expr[1], env));
            case "math.max"    : return Math.max(this.inter.evalExpr(expr[1], env), this.inter.evalExpr(expr[2], env));
            case "math.min"    : return Math.min(this.inter.evalExpr(expr[1], env), this.inter.evalExpr(expr[2], env));
            case "math.pow"    : return Math.pow(this.inter.evalExpr(expr[1], env), this.inter.evalExpr(expr[2], env));
            case "math.random" : return Math.random();
            case "math.round"  : return Math.round(this.inter.evalExpr(expr[1], env));
            case "math.sqrt"   : return Math.sqrt(this.inter.evalExpr(expr[1], env));
        }

        throw "Error: Not found in 'math-lib': " + expr[0];
    }
}
