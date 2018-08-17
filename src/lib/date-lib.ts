"use strict";

class DateLib implements ILib {
    private readonly inter: Interpreter;

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "date.now"       : return Date.now();
            case "date.to-string" : return (new Date(this.inter.evalExpr(expr[1], env))).toString();
        }

        return "##not-resolved##";
    }
}
