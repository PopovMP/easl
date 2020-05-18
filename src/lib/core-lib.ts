"use strict";

class CoreLib implements ILib {
    private readonly inter: Interpreter;
    public readonly builtinFunc = ["!=", "%", "*", "+", "-", "/", "<", "<=", "=", ">", ">=", "eval", "not",
        "parse", "print", "to-boolean", "to-number", "to-string", "type-of", "display", "newline"];
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
            case "!="         : return this.evalNotEqual(expr, env);
            case ">"          : return this.evalGreater(expr, env);
            case ">="         : return this.evalGreaterOrEqual(expr, env);
            case "<"          : return this.evalLower(expr, env);
            case "<="         : return this.evalLowerOrEqual(expr, env);
            case "not"        : return this.evalNot(expr, env);
            case "type-of"    : return this.evalTypeOf(expr, env);
            case "to-string"  : return this.evalToString(expr, env);
            case "to-number"  : return this.evalToNumber(expr, env);
            case "to-boolean" : return this.evalToBoolean(expr, env);
            case "parse"      : return this.evalParse(expr, env);
            case "eval"       : return this.evalEval(expr, env);
            case "print"      : return this.evalPrint(expr, env);
            case "display"    : return this.evalDisplay(expr, env);
            case "newline"    : return this.evalNewline(expr);
        }

        throw "Error: Not found in 'core-lib': " + expr[0];
    }

    // [+, obj1, ob2, ..., obj_n]
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

    // [-, num1, num2]
    private evalSubtract(expr: any[], env: any[]): any {
        if (expr.length === 2) {
            return -this.inter.evalExpr(expr[1], env);
        }

        if (expr.length === 3) {
            return this.inter.evalExpr(expr[1], env) - this.inter.evalExpr(expr[2], env);
        }

        throw "Error: '-' requires 2 arguments. Given: " + (expr.length - 1);
    }

    // [*, num1, num2, ..., num_n]
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
            if (a === 0) {
                return 0;
            }

            const b: any = this.inter.evalExpr(expr[2], env);

            if (typeof b !== "number") {
                throw Error("Wrong parameter type: " + "*");
            }

            return a * b;
        }

        return a * this.evalMultiply(expr.slice(1), env);
    }

    // [/, num1, num2]
    private evalDivide(expr: any[], env: any[]): any {
        if (expr.length !== 3) {
            throw "Error: '/' requires 2 arguments. Given: " + (expr.length - 1);
        }

        const divisor = this.inter.evalExpr(expr[2], env);

        if (divisor === 0) {
            throw Error("Error: '/' - division by zero");
        }

        return this.inter.evalExpr(expr[1], env) / divisor;
    }

    private evalModulo(expr: any[], env: any[]): any {
        if (expr.length !== 3) {
            throw "Error: '%' requires 2 arguments. Given: " + (expr.length - 1);
        }

        return this.inter.evalExpr(expr[1], env) % this.inter.evalExpr(expr[2], env);
    }

    // [=, obj1, obj2, ...]
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

        throw "Error: '=' requires 2 or more arguments. Given: " + (expr.length - 1);
    }

    // [>, obj1, obj2]
    private evalGreater(expr: any[], env: any[]): any {
        if (expr.length !== 3) {
            throw "Error: '>' requires 2 arguments. Given: " + (expr.length - 1);
        }

        return this.inter.evalExpr(expr[1], env) > this.inter.evalExpr(expr[2], env);
    }

    // [<, obj1, obj2]
    private evalLower(expr: any[], env: any[]): any {
        if (expr.length !== 3) {
            throw "Error: '<' requires 2 arguments. Given: " + (expr.length - 1);
        }

        return this.inter.evalExpr(expr[1], env) < this.inter.evalExpr(expr[2], env);
    }

    // [!=, obj1, obj2]
    private evalNotEqual(expr: any[], env: any[]): any {
        if (expr.length !== 3) {
            throw "Error: '!=' requires 2 arguments. Given: " + (expr.length - 1);
        }

        return this.inter.evalExpr(expr[1], env) !== this.inter.evalExpr(expr[2], env);
    }

    // [>=, obj1, obj2]
    private evalGreaterOrEqual(expr: any[], env: any[]): any {
        if (expr.length !== 3) {
            throw "Error: '>=' requires 2 arguments. Given: " + (expr.length - 1);
        }

        return this.inter.evalExpr(expr[1], env) >= this.inter.evalExpr(expr[2], env);
    }

    // [<=, obj1, obj2]
    private evalLowerOrEqual(expr: any[], env: any[]): any {
        if (expr.length !== 3) {
            throw "Error: '<=' requires 2 arguments. Given: " + (expr.length - 1);
        }

        return this.inter.evalExpr(expr[1], env) <= this.inter.evalExpr(expr[2], env);
    }

    // [not, obj]
    private evalNot(expr: any[], env: any[]): boolean {
        if (expr.length !== 2) {
            throw "Error: 'not' requires 1 argument. Given: " + (expr.length - 1);
        }

        const entity = this.inter.evalExpr(expr[1], env);

        return (Array.isArray(entity) && entity.length === 0) || !entity;
    }

    // [type-of, obj]
   private evalTypeOf(expr: any[], env: any[]): string {
        if (expr.length !== 2) {
            throw "Error: 'type-of' requires 1 argument. Given: " + (expr.length - 1);
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

    // [to-boolean, obj]
    private evalToBoolean(expr: any[], env: any[]): boolean {
        if (expr.length !== 2) {
            throw "Error: 'to-boolean' requires 1 argument. Given: " + (expr.length - 1);
        }

        return !this.evalNot(expr, env);
    }

    // [to-number, obj]
    private evalToNumber(expr: any[], env: any[]): number | null {
        if (expr.length !== 2) {
            throw "Error: 'to-number' requires 1 argument. Given: " + (expr.length - 1);
        }

        const entity = this.inter.evalExpr(expr[1], env);
        const number = Number(entity);

        return number !== number ? null : number;
    }

    // [parse, src]
    private evalParse(expr: any[], env: any[]): any[] {
        if (expr.length !== 2) {
            throw "Error: 'parse' requires 2 arguments. Given: " + (expr.length - 1);
        }

        const codeText: string = this.inter.evalExpr(expr[1], env);
        const parser: Parser = new Parser();

        return parser.parse(codeText);
    }

    // [eval, src]
    private evalEval(expr: any[], env: any[]): any[] {
        if (expr.length !== 2) {
            throw "Error: 'eval' requires 1 argument. Given: " + (expr.length - 1);
        }

        const codeTree: any[] = this.inter.evalExpr(expr[1], env);

        return this.inter.evalCodeTree(codeTree, this.inter.options);
    }

    private evalPrint(expr: any[], env: any[]): null {
        if (expr.length === 1) {
            this.inter.options.printer("\r\n");
        } else if (expr.length === 2) {
            const text = this.evalToString(expr, env);
            this.inter.options.printer(text + "\r\n");
        } else {
            const text = this.inter.mapExprLst(expr.slice(1), env)
                .map((e: any | any[]) => Printer.stringify(e))
                .join(" ")
            this.inter.options.printer(text + "\r\n");
        }

        return null;
    }

    private evalDisplay(expr: any[], env: any[]): null {
        if (expr.length !== 2) {
            throw "Error: 'display' requires 1 argument. Given: " + (expr.length - 1);
        }

        const text = this.evalToString(expr, env);
        this.inter.options.printer(text);

        return null;
    }

    private evalNewline(expr: any[]): null {
        if (expr.length !== 1) {
            throw "Error: 'newline' requires 0 arguments. Given: " + (expr.length - 1);
        }

        this.inter.options.printer("\r\n");

        return null;
    }

    private evalToString(expr: any[], env: any[]): string {
        if (expr.length !== 2) {
            throw "Error: 'to-string' requires 1 argument. Given: " + (expr.length - 1);
        }

        const res: any | any[] = this.inter.evalExpr(expr[1], env);
        return Printer.stringify(res);
    }
}
