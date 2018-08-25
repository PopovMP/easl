"use strict";

class StringLib implements ILib {
    private readonly inter: Interpreter;

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "str.length" : return this.strLength(expr, env);
            case "str.has"    : return this.strHas(expr, env);
            case "str.split"  : return this.strSplit(expr, env);
            case "str.concat" : return this.strConcat(expr, env);
        }

        return "##not-resolved##";
    }

    private strLength(expr: any[], env: any): number {
        const str = this.inter.evalExpr(expr[1], env);
        return typeof str === "string" ? str.length : -1;
    }

    private strHas(expr: any[], env: any): boolean {
        const elem: string = this.inter.evalExpr(expr[1], env);
        const str : string = this.inter.evalExpr(expr[2], env);
        return str.includes(elem);
    }

    private strSplit(expr: any[], env: any): string[] {
        const sep: string = this.inter.evalExpr(expr[1], env);
        const str: string = this.inter.evalExpr(expr[2], env);
        return str.split(sep);
    }

    private strConcat(expr: any[], env: any): string {
        const str1: string = this.inter.evalExpr(expr[1], env);
        const str2: string = this.inter.evalExpr(expr[2], env);
        return str1 + str2;
    }
}
