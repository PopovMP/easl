"use strict";

class CoreLib implements ILib {
    private readonly inter: Interpreter;

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "+"   : return this.inter.evalExpr(expr[1], env) + this.inter.evalExpr(expr[2], env);
            case "-"   : return this.inter.evalExpr(expr[1], env) - this.inter.evalExpr(expr[2], env);
            case "*"   : return this.inter.evalExpr(expr[1], env) * this.inter.evalExpr(expr[2], env);
            case "/"   : return this.inter.evalExpr(expr[1], env) / this.inter.evalExpr(expr[2], env);
            case "%"   : return this.inter.evalExpr(expr[1], env) % this.inter.evalExpr(expr[2], env);

            case "="   : return this.inter.evalExpr(expr[1], env) === this.inter.evalExpr(expr[2], env);
            case ">"   : return this.inter.evalExpr(expr[1], env) >   this.inter.evalExpr(expr[2], env);
            case "<"   : return this.inter.evalExpr(expr[1], env) <   this.inter.evalExpr(expr[2], env);
            case "!="  : return this.inter.evalExpr(expr[1], env) !== this.inter.evalExpr(expr[2], env);
            case ">="  : return this.inter.evalExpr(expr[1], env) >=  this.inter.evalExpr(expr[2], env);
            case "<="  : return this.inter.evalExpr(expr[1], env) <=  this.inter.evalExpr(expr[2], env);

            case "and" : return this.inter.evalExpr(expr[1], env) && this.inter.evalExpr(expr[2], env);
            case "or"  : return this.inter.evalExpr(expr[1], env) || this.inter.evalExpr(expr[2], env);
            case "not" : return this.evalNot(this.inter.evalExpr(expr[1], env));

            case "type-of"    : return this.evalTypeOf(expr[1], env);
            case "to-string"  : return String(this.inter.evalExpr(expr[1], env));
            case "to-number"  : return this.toNumber(this.inter.evalExpr(expr[1], env));
            case "to-boolean" : return this.toBoolean(this.inter.evalExpr(expr[1], env));

            case "print" : return this.inter.print(String(this.inter.mapExprLst(expr.slice(1), env).join(" "))) || "";
        }

        return "##not-resolved##";
    }

    private evalTypeOf (expr: any, env: any[]): string {
        if (Array.isArray(expr)) {
            switch (expr[0]) {
                case "list"     : return "list";
                case "string"   : return "string";
                case "lambda"   :
                case "function" :
                case "closure"  : return "function";
            }
        }

        if (expr === "null") return "null";

        const value =  this.inter.evalExpr(expr, env);

        if (Array.isArray(value)) {
            switch (value[0]) {
                case "lambda"   :
                case "function" :
                case "closure"  : return "function";
            }
        }

        return typeof value;
    }

    private evalNot(a: any): boolean {
        return (Array.isArray(a) && a.length === 0) || !a;
    }

    private toBoolean(a: any): boolean {
        return !this.evalNot(a);
    }

    private toNumber(a: any): number | null {
        const number = Number(a);
        return Number.isNaN(number) ? null : number;
    };
}
