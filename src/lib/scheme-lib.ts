"use strict";

class SchemeLib implements ILib {
    private readonly inter: Interpreter;

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {

            case "eq?"      : return this.inter.evalExpr(expr[1], env) === this.inter.evalExpr(expr[2], env);

            case "boolean?" : return this.isBoolean(this.inter.evalExpr(expr[1], env));
            case "null?"    : return this.isNull(this.inter.evalExpr(expr[1], env));
            case "number?"  : return this.isNumber(this.inter.evalExpr(expr[1], env));
            case "string?"  : return this.isString(this.inter.evalExpr(expr[1], env));

            case "pair?"    : return this.isPair(this.inter.evalExpr(expr[1], env));
            case "list?"    : return this.isList(this.inter.evalExpr(expr[1], env));

            case "cons"     : return this.evalCons(expr, env);

            case "car"      : return this.car(this.inter.evalExpr(expr[1], env));
            case "cdr"      : return this.cdr(this.inter.evalExpr(expr[1], env));
            case "caar"     : return this.caar(this.inter.evalExpr(expr[1], env));
            case "cadr"     : return this.cadr(this.inter.evalExpr(expr[1], env));
            case "cdar"     : return this.cdar(this.inter.evalExpr(expr[1], env));
            case "cddr"     : return this.cddr(this.inter.evalExpr(expr[1], env));

            case "length"    : return this.length(this.inter.evalExpr(expr[1], env));
        }

        return "##not-resolved##";
    }

    private isNull    = (a: any) => a === null;
    private isNumber  = (a: any) => typeof a === "number";
    private isString  = (a: any) => typeof a === "string";
    private isBoolean = (a: any) => typeof a === "boolean";

    private isList = (a: any) => Array.isArray(a);
    private isPair = (lst: any[]) => Array.isArray(lst) && lst.length > 0;
    private length = (lst: any[]) => Array.isArray(lst) ? lst.length : -1;

    private evalCons(expr: any[], env: any[]): any[] {
        const a = this.inter.evalExpr(expr[1], env);
        const b = this.inter.evalExpr(expr[2], env);
        if (b === null) return [a];
        if (this.isList(b)) {
            return  b.unshift(a) && b;
        }
        return [a, b];
    }

    private car  = (lst: any[]) => lst[0];
    private cdr  = (lst: any[]) => lst.slice(1);
    private caar = (lst: any[]) => lst[0][0];
    private cadr = (lst: any[]) => lst[1];
    private cdar = (lst: any[]) => lst[0].slice(1);
    private cddr = (lst: any[]) => lst.slice(2);
}
