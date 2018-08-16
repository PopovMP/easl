"use strict";

class SchemeLib implements ILib {
    private readonly inter: Interpreter;

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;
    }

    public eval(expr: any[], env: any[]): any {
        switch (expr[0]) {

            case "eq?"      : return this.inter.evalExpr(expr[1], env) === this.inter.evalExpr(expr[2], env);

            case "boolean?" : return this.isBoolean(this.inter.evalExpr(expr[1], env));
            case "null?"    : return this.isNull(this.inter.evalExpr(expr[1], env));
            case "number?"  : return this.isNumber(this.inter.evalExpr(expr[1], env));
            case "string?"  : return this.isString(this.inter.evalExpr(expr[1], env));

            case "pair?"    : return this.isPair(this.inter.evalExpr(expr[1], env));
            case "list?"    : return this.isList(this.inter.evalExpr(expr[1], env));

            case "cons"     : return this.evalCons(expr.slice(1), env);

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

    private evalCons(argsLst: any[], env: any[]): any[] {
        const a = this.inter.evalExpr(argsLst[0], env);
        const b = this.inter.evalExpr(argsLst.slice(1), env);
        if (b === null) return [a];
        if ( this.isList(b)) return  b.unshift(a) && b;
        return [a, b];
    }

    private car  = (lst: any[]) => lst[0];
    private cdr  = (lst: any[]) => lst.slice(1);
    private caar = (lst: any[]) => this.car(this.car(lst));
    private cadr = (lst: any[]) => this.car(this.cdr(lst));
    private cdar = (lst: any[]) => this.cdr(this.car(lst));
    private cddr = (lst: any[]) => this.cdr(this.cdr(lst));
}
