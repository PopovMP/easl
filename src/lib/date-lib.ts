"use strict";

class DateLib implements ILib {
    private readonly inter: Interpreter;
    private readonly methods: any = {
        "date-now"       : this.evalDateNow,
        "date-to-string" : this.evalDateToString,
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

    // (date-now)
    private evalDateNow(expr: any[], env: any[]): number {
        this.inter.evalArgs([], expr, env);

        return Date.now();
    }

    // (date-to-string date)
    private evalDateToString(expr: any[], env: any[]): string {
        const [date] = <[number]>this.inter.evalArgs(["number"], expr, env);

        return new Date(date).toString();
    }
}
