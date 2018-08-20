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

            case "type-of"    : return this.evalTypeOf(expr, env);
            case "to-string"  : return this.evalToString(expr, env);
            case "to-number"  : return this.evalToNumber(expr, env);
            case "to-boolean" : return this.evalToBoolean(expr, env);

            case "print" : return this.evalPrint(expr, env);
        }

        return "##not-resolved##";
    }

    private evalTypeOf (expr: any[], env: any[]): string {
        if (expr.length === 1) {
            return "null";
        }

        const entity = expr[1];

        if (Array.isArray(entity)) {
            switch (entity[0]) {
                case "list"     : return "list";
                case "string"   : return "string";
                case "lambda"   :
                case "function" :
                case "closure"  : return "function";
            }
        }

        if (entity === "null") return "null";

        const value =  this.inter.evalExpr(entity, env);

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

    private evalToBoolean(expr: any[], env: any[]): boolean {
        const entity = this.inter.evalExpr(expr[1], env);
        return !this.evalNot(entity);
    }

    private evalToNumber(expr: any[], env: any[]): number | null {
        const entity = this.inter.evalExpr(expr[1], env);
        const number = Number(entity);
        return Number.isNaN(number) ? null : number;
    }

    private evalToString(expr: any[], env: any[]): string {
        function bodyToString(body: any): string {
            if (Array.isArray(body)) {
                if (body[0] === "begin") {
                    return body.slice(1).join(" ");
                }

                return body.join(" ");
            }

            return String(body);
        }

        function getText(entity: any): string {
            const type = typeof entity;
            if (entity === null) {
                return "null";
            }

            if (type === "string") {
                return entity;
            }

            if (type === "boolean" || type === "number") {
                return String(entity);
            }

            if (Array.isArray(entity)) {
                if ( entity[0] === "closure") {
                    return "{lambda (" + entity[1].join(" ") + ") (" + bodyToString(entity[2]) + ")}";
                } else {
                    return entity.join(" ");
                }
            }

            return JSON.stringify(entity);
        }

        let text = "";
        if (expr.length === 2) {
            text = getText(this.inter.evalExpr(expr[1], env));
        } else if (expr.length > 2) {
            text = getText(this.inter.mapExprLst(expr.slice(1), env));
        }

        return text;
    }

    private evalPrint(expr: any[], env: any[]): any {
        const text = this.evalToString(expr, env);
        const res = this.inter.print(text);
        return res || "";
    }
}
