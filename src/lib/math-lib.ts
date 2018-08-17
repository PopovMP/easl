"use strict";

class MathLib implements ILib {
    private readonly inter: Interpreter;

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "math.pi"      : return Math.PI;
            case "math.abs"     : return Math.abs(this.inter.evalExpr(expr[1], env));
            case "math.ceil"    : return Math.ceil(this.inter.evalExpr(expr[1], env));
            case "math.floor"   : return Math.floor(this.inter.evalExpr(expr[1], env));
            case "math.log"     : return Math.log10(this.inter.evalExpr(expr[1], env));
            case "math.max"     : return Math.max(this.inter.evalExpr(expr[1], env), this.inter.evalExpr(expr[2], env));
            case "math.min"     : return Math.min(this.inter.evalExpr(expr[1], env), this.inter.evalExpr(expr[2], env));
            case "math.pow"     : return Math.pow(this.inter.evalExpr(expr[1], env), this.inter.evalExpr(expr[2], env));
            case "math.random"  : return Math.random();
            case "math.round"   : return Math.round(this.inter.evalExpr(expr[1], env));
            case "math.sign"    : return Math.sign(this.inter.evalExpr(expr[1], env));
            case "math.sqrt"    : return Math.sqrt(this.inter.evalExpr(expr[1], env));
            case "math.trunc"   : return Math.trunc(this.inter.evalExpr(expr[1], env));
        }

        return "##not-resolved##";
    }
}
