"use strict";

class DateLib implements ILib {
    private readonly inter: Interpreter;
    public readonly builtinFunc = ["date.now", "date.to-string"];
    public readonly builtinHash: any = {};

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;

        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "date.now"       : return Date.now();
            case "date.to-string" : return (new Date(this.inter.evalExpr(expr[1], env))).toString();
        }

        throw Error("Not found in 'date-lib': " + expr[0]);
    }
}
