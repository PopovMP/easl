"use strict";

class CoreLib implements ILib {
    private readonly inter: Interpreter;
    public readonly builtinFunc = ["!=", "%", "*", "+", "-", "/", "<", "<=", "=", ">", ">=", "and", "eval", "not", "or",
        "parse", "print", "to-boolean", "to-number", "to-string", "type-of"];
    public readonly builtinHash: any = {};

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;

        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "+"          : return this.evalPlus(expr, env);
            case "-"          : return this.evalSubtract(expr, env);
            case "*"          : return this.evalMultiply(expr, env);
            case "/"          : return this.evalDivide(expr, env);
            case "%"          : return this.evalModulo(expr, env);
            case "="          : return this.evalEqual(expr, env);
            case ">"          : return this.inter.evalExpr(expr[1], env) > this.inter.evalExpr(expr[2], env);
            case "<"          : return this.inter.evalExpr(expr[1], env) < this.inter.evalExpr(expr[2], env);
            case "!="         : return this.inter.evalExpr(expr[1], env) !== this.inter.evalExpr(expr[2], env);
            case ">="         : return this.inter.evalExpr(expr[1], env) >= this.inter.evalExpr(expr[2], env);
            case "<="         : return this.inter.evalExpr(expr[1], env) <= this.inter.evalExpr(expr[2], env);
            case "and"        : return this.evalAnd(expr, env);
            case "or"         : return this.evalOr(expr, env);
            case "not"        : return this.evalNot(this.inter.evalExpr(expr[1], env));
            case "type-of"    : return this.evalTypeOf(expr, env);
            case "to-string"  : return this.evalToString(expr, env);
            case "to-number"  : return this.evalToNumber(expr, env);
            case "to-boolean" : return this.evalToBoolean(expr, env);
            case "parse"      : return this.evalParse(expr, env);
            case "eval"       : return this.evalEval(expr, env);
            case "print"      : return this.evalPrint(expr, env);
        }

        throw "Error: Not found in 'core-lib': " + expr[0];
    }

    private evalPlus(expr: any[], env: any[]): any {
        if (expr.length === 1) {
            return 0;
        }

        const a: any = this.inter.evalExpr(expr[1], env);

        if (expr.length === 2) {
            if (typeof a === "string" || typeof a === "number") {
                return a;
            }

            throw Error("Wrong parameter type: " + "+");
        }

        if (expr.length === 3) {
            const b: any = this.inter.evalExpr(expr[2], env);

            if (typeof a === "string") {
                if (typeof b === "string") {
                    return a + b;
                }

                if (typeof b === "number") {
                    return a + b.toString();
                }

                throw Error("Wrong parameter types: " + "+");
            }

            if (typeof a === "number" && typeof b === "number") {
                return a + b;
            }

            throw Error("Wrong parameter types: " + "+");
        }

        return a + this.evalPlus(expr.slice(1), env);
    }

    private evalSubtract(expr: any[], env: any[]): any {
        if (expr.length === 2) {
            return -this.inter.evalExpr(expr[1], env);
        }

        if (expr.length === 3) {
            return this.inter.evalExpr(expr[1], env) - this.inter.evalExpr(expr[2], env);
        }

        throw Error("Wrong number of arguments: " + "-");
    }

    private evalMultiply(expr: any[], env: any[]): any {
        if (expr.length === 1) {
            return 0;
        }

        const a: any = this.inter.evalExpr(expr[1], env);
        if (typeof a !== "number") {
            throw Error("Wrong parameter type: " + "*");
        }

        if (expr.length === 2) {
            return a;
        }

        if (expr.length === 3) {
            const b: any = this.inter.evalExpr(expr[2], env);

            if (typeof b !== "number") {
                throw Error("Wrong parameter type: " + "*");
            }

            return a * b;
        }

        return a * this.evalMultiply(expr.slice(1), env);
    }

    private evalDivide(expr: any[], env: any[]): any {
        if (expr.length !== 3) {
            throw Error("Wrong number of arguments: " + "/");
        }

        const divisor = this.inter.evalExpr(expr[2], env);

        if (divisor === 0) {
            throw Error("Division by zero");
        }

        return this.inter.evalExpr(expr[1], env) / divisor;
    }

    private evalModulo(expr: any[], env: any[]): any {
        if (expr.length !== 3) {
            throw Error("Wrong number of arguments: " + "%");
        }

        return this.inter.evalExpr(expr[1], env) % this.inter.evalExpr(expr[2], env);
    }

    private evalEqual(expr: any[], env: any[]): any {
        if (expr.length === 3) {
            return this.inter.evalExpr(expr[1], env) === this.inter.evalExpr(expr[2], env);
        }

        if (expr.length > 3) {
            const first = this.inter.evalExpr(expr[1], env);

            for (let i = 2; i < expr.length; i++) {
                if (this.inter.evalExpr(expr[i], env) !== first) {
                    return false;
                }
            }

            return true
        }

        throw Error("Wrong number of arguments: " + "=");
    }

    private evalAnd(expr: any[], env: any[]): boolean {
        if (expr.length === 1) {
            return true;
        }

        if (expr.length === 2) {
            return this.inter.evalExpr(expr[1], env);
        }

        if (expr.length === 3) {
            const val: any = this.inter.evalExpr(expr[1], env);
            return this.inter.isTruthy(val) ? this.inter.evalExpr(expr[2], env) : val;
        }

        const val: any = this.inter.evalExpr(expr[1], env);
        return this.inter.isTruthy(val) ? this.evalAnd(expr.slice(1), env) : val;
    }

    private evalOr(expr: any[], env: any[]): any {
        if (expr.length === 1) {
            return false;
        }

        if (expr.length === 2) {
            return this.inter.evalExpr(expr[1], env);
        }

        if (expr.length === 3) {
            const val: any = this.inter.evalExpr(expr[1], env);
            return this.inter.isTruthy(val) ? val : this.inter.evalExpr(expr[2], env);
        }

        const val: any = this.inter.evalExpr(expr[1], env);
        return this.inter.isTruthy(val) ? val : this.evalOr(expr.slice(1), env);
    }

    private evalNot(a: any): boolean {
        return (Array.isArray(a) && a.length === 0) || !a;
    }

    private evalTypeOf(expr: any[], env: any[]): string {
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

        if (entity === "null") {
            return "null";
        }

        const value = this.inter.evalExpr(entity, env);

        if (Array.isArray(value)) {
            switch (value[0]) {
                case "lambda"   :
                case "function" :
                case "closure"  : return "function";
            }

            return "list";
        }

        if (value === null) {
            return "null";
        }

        return typeof value;
    }

    private evalToBoolean(expr: any[], env: any[]): boolean {
        const entity = this.inter.evalExpr(expr[1], env);

        return !this.evalNot(entity);
    }

    private evalToNumber(expr: any[], env: any[]): number | null {
        const entity = this.inter.evalExpr(expr[1], env);
        const number = Number(entity);

        return number !== number ? null : number;
    }

    private evalToString(expr: any[], env: any[]): string {
        function bodyToString(body: any): string {
            if (Array.isArray(body)) {
                if (body[0] === "block") {
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
                if (entity[0] === "closure") {
                    return "{lambda (" + entity[1].join(" ") + ") (" + bodyToString(entity[2]) + ")}";
                }

                return entity.join(" ");
            }

            return JSON.stringify(entity);
        }

        if (expr.length === 2) {
            return getText(this.inter.evalExpr(expr[1], env));
        }

        if (expr.length > 2) {
            return getText(this.inter.mapExprLst(expr.slice(1), env));
        }

        return "";
    }

    private evalParse(expr: any[], env: any[]): any[] {
        const codeText: string = this.inter.evalExpr(expr[1], env);
        const parser: Parser = new Parser();

        return parser.parse(codeText);
    }

    private evalEval(expr: any[], env: any[]): any[] {
        const codeTree: any[] = this.inter.evalExpr(expr[1], env);

        return this.inter.evalCodeTree(codeTree, this.inter.options);
    }

    private evalPrint(expr: any[], env: any[]): any {
        const text = this.evalToString(expr, env);
        this.inter.options.printer(text);

        return null;
    }
}
