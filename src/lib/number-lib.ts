"use strict";

class NumberLib implements ILib {
    private readonly inter: Interpreter;

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "numb.epsilon"       : return Number.EPSILON;
            case "numb.max-value"     : return Number.MAX_VALUE;
            case "numb.min-value"     : return Number.MIN_VALUE;
            case "numb.is-integer"    : return Number.isInteger(this.inter.evalExpr(expr[1], env));
            case "numb.parse-float"   : return Number.parseFloat(this.inter.evalExpr(expr[1], env));
            case "numb.parse-integer" : return Number.parseInt(this.inter.evalExpr(expr[1], env));
            case "numb.to-fixed"      : return (<number>(this.inter.evalExpr(expr[1], env))).toFixed(this.inter.evalExpr(expr[1], env));
            case "numb.to-string"     : return (<number>(this.inter.evalExpr(expr[1], env))).toString(10);
        }

        return "##not-resolved##";
    }
}
