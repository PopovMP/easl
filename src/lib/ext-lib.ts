"use strict";

class ExtLib implements ILib {
    private readonly inter: Interpreter;
    public readonly builtinFunc: string[] = [];
    public readonly builtinHash: any = {};

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;

        for (const funcName of Object.keys(this.inter.options.extFunctions)) {
            this.builtinFunc.push(funcName);
            this.builtinHash[funcName] = true;
        }
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        const funcName: string = expr[0];

        if (this.builtinFunc.indexOf(funcName) === -1) {
            throw "Error: Not found in 'ext-lib': " + funcName;
        }

        const argsList = this.inter.mapExprList(expr.slice(1), env);
        return this.inter.options.extFunctions[funcName].apply(this.inter.options.extContext, argsList);
    }
}
