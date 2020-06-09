"use strict";

class CoreLib implements ILib {
    private readonly inter: Interpreter;
    private readonly methods: any = {
        "+"          : this.evalPlus,
        "-"          : this.evalSubtract,
        "*"          : this.evalMultiply,
        "/"          : this.evalDivide,
        "%"          : this.evalModulo,
        "="          : this.evalEqual,
        "!="         : this.evalNotEqual,
        ">"          : this.evalGreater,
        ">="         : this.evalGreaterOrEqual,
        "<"          : this.evalLower,
        "<="         : this.evalLowerOrEqual,
        "not"        : this.evalNot,
        "type-of"    : this.evalTypeOf,
        "to-string"  : this.evalToString,
        "to-number"  : this.evalToNumber,
        "to-boolean" : this.evalToBoolean,
        "parse"      : this.evalParse,
        "eval"       : this.evalEval,
        "print"      : this.evalPrint,
        "display"    : this.evalDisplay,
        "newline"    : this.evalNewline,
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

            throw `Error: '+' requires a string or a number. Given: ${a}`;
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
            }

            if (typeof a === "number" && typeof b === "number") {
                return a + b;
            }

            throw `Error: '+' requires strings or numbers. Given: ${a}, ${b}`;
        }

        return a + this.evalPlus(expr.slice(1), env);
    }

    // [-, num1, num2]
    private evalSubtract(expr: any[], env: any[]): number {
        if (expr.length === 1 || expr.length > 3) {
            throw `Error: '-' requires 1 or 2 arguments. Given: ${expr.length - 1}`;
        }

        const num1: any = this.inter.evalExpr(expr[1], env);
        if (typeof num1 !== "number") {
            throw `Error: '-' requires a number. Given: ${num1}`;
        }

        if (expr.length === 2) {
            return -num1;
        }

        const num2: any = this.inter.evalExpr(expr[2], env);
        if (typeof num2 !== "number") {
            throw `Error: '-' requires a number. Given: ${num2}`;
        }

        return num1 - num2;
    }

    // [*, num1, num2, ..., num_n]
    private evalMultiply(expr: any[], env: any[]): any {
        if (expr.length === 1) {
            return 0;
        }

        const a: any = this.inter.evalExpr(expr[1], env);
        if (typeof a !== "number") {
            throw `Error: '*' requires a number. Given: ${a}`;
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
                throw `Error: '*' requires numbers. Given: ${a}, ${b}`;
            }

            return a * b;
        }

        return a * this.evalMultiply(expr.slice(1), env);
    }

    // [/, num1, num2]
    private evalDivide(expr: any[], env: any[]): any {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);

        if (num2 === 0) {
            throw "Error: '/' division by zero.";
        }

        return num1 / num2;
    }

    // [%, num1, num2]
    private evalModulo(expr: any[], env: any[]): any {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);

        return num1 % num2;
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
    private evalGreater(expr: any[], env: any[]): boolean {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);

        return num1 > num2;
    }

    // [<, obj1, obj2]
    private evalLower(expr: any[], env: any[]): boolean {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);

        return num1 < num2;
    }

    // [!=, obj1, obj2]
    private evalNotEqual(expr: any[], env: any[]): any {
        const [val1, val2] = this.inter.evalArgs(["scalar", "scalar"], expr, env);

        return val1 !== val2;
    }

    // [>=, obj1, obj2]
    private evalGreaterOrEqual(expr: any[], env: any[]): any {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);

        return num1 >= num2;
    }

    // [<=, obj1, obj2]
    private evalLowerOrEqual(expr: any[], env: any[]): any {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);

        return num1 <= num2;
    }

    // [not, obj]
    private evalNot(expr: any[], env: any[]): boolean {
        const [obj] = this.inter.evalArgs(["any"], expr, env);

        return Array.isArray(obj) && obj.length === 0 || !Boolean(obj);
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
        const [obj] = this.inter.evalArgs(["any"], expr, env);

        return  Array.isArray(obj) && obj.length === 0 ? false : Boolean(obj);
    }

    // [to-number, obj]
    private evalToNumber(expr: any[], env: any[]): number | null {
        const [obj] = this.inter.evalArgs(["any"], expr, env);
        const number = Number(obj);

        return isNaN(number) ? null : number;
    }

    // [parse, src]
    private evalParse(expr: any[], env: any[]): any[] {
        const [scr] = this.inter.evalArgs(["string"], expr, env);
        const parser: Parser = new Parser();

        return parser.parse(scr);
    }

    // [eval, src]
    private evalEval(expr: any[], env: any[]): any[] {
        const [obj] = this.inter.evalArgs(["any"], expr, env);

        return this.inter.evalCodeTree(obj, this.inter.options);
    }

    // [print, expr1, expr2, ...]
    private evalPrint(expr: any[], env: any[]): void {
        if (expr.length === 1) {
            this.inter.options.printer("\r\n");
        } else if (expr.length === 2) {
            const text = this.evalToString(expr, env);
            this.inter.options.printer(text + "\r\n");
        } else {
            const text = this.inter.mapExprList(expr.slice(1), env)
                .map(Printer.stringify)
                .join(" ")
            this.inter.options.printer(text + "\r\n");
        }
    }

    // [display, expr]
    private evalDisplay(expr: any[], env: any[]): void {
        const [obj] = this.inter.evalArgs(["any"], expr, env);

        this.inter.options.printer( Printer.stringify(obj) );
    }

    // [newline]
    private evalNewline(expr: any[], env: any[]): void {
        this.inter.evalArgs([], expr, env);

        this.inter.options.printer("\r\n");
    }

    // [to-string, expr]
    private evalToString(expr: any[], env: any[]): string {
        const [obj] = this.inter.evalArgs(["any"], expr, env);

        return Printer.stringify(obj);
    }
}
