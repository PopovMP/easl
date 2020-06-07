"use strict";

class DateLib implements ILib {
    private readonly app: Applicator;
    private readonly methods: any = {
        "date.now"       : this.evalDateNow,
        "date.to-string" : this.evalDateToString,
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

    // (date.now)
    private evalDateNow(expr: any[], env: any[]): number {
        return this.app.callWithNoArgs<number>(Date.now, "date.now", expr, env);
    }

    // (date.to-string date)
    private evalDateToString(expr: any[], env: any[]): string {
        return this.app.callWithNumber<string>(
            (n: number): string => new Date(n).toString(),
            "date.to-string", expr, env);
    }
}
