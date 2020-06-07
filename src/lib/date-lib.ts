"use strict";

class DateLib implements ILib {
    private readonly inter: Interpreter;
    private readonly methods: any = {
        "date.now"       : this.evalDateNow,
        "date.to-string" : this.evalDateToString,
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

    private evalDateNow(): number {
        return Date.now();
    }

    private evalDateToString(expr: any[], env: any[]): string {
        return ( new Date( this.inter.evalExpr(expr[1], env) )).toString();
    }
}
