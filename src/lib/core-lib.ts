"use strict";

class CoreLib implements ILib {
    private readonly inter: Interpreter;
    private readonly methods: any = {
        "+"          : this.evalAdd,
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
        "~"          : this.evalAddStrings,
        "equal"      : this.evalScalarEqual,
        "not"        : this.evalNot,
        "to-string"  : this.evalToString,
        "to-number"  : this.evalToNumber,
        "to-boolean" : this.evalToBoolean,
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

    // (+ num1 num2 ...)
    private evalAdd(expr: any[], env: any[]): any {
        if (expr.length === 1) {
            return 0;
        }

        if (expr.length === 2) {
            const [num] = <[number]>this.inter.evalArgs(["number"], expr, env);

            return num;
        }

        if (expr.length === 3) {
            const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

            return num1 + num2;
        }

        let sum: number = 0;
        for (let i: number = 1; i < expr.length; i++) {
            const num = this.inter.evalExpr(expr[i], env);
            if (typeof num !== "number") {
                throw `Error: '+' requires a number. Given: ${num}`;
            }
            sum += num;
        }

        return sum;
    }

    // (- num1 num2)
    private evalSubtract(expr: any[], env: any[]): number {
        if (expr.length === 2) {
            const [num] = <[number]>this.inter.evalArgs(["number"], expr, env);

            return -num;
        }

        const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

        return num1 - num2;
    }

    // (* num1 num2 ...)
    private evalMultiply(expr: any[], env: any[]): any {
        if (expr.length === 1) {
            return 1;
        }

        if (expr.length === 2) {
            const [num] = <[number]>this.inter.evalArgs(["number"], expr, env);

            return num;
        }

        if (expr.length === 3) {
            const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

            return num1 * num2;
        }

        let res: number = 1;
        for (let i: number = 1; i < expr.length; i++) {
            const num = this.inter.evalExpr(expr[i], env);

            if (typeof num !== "number") {
                throw `Error: '*' requires a number. Given: ${num}`;
            }

            res *= num;
        }

        return res;
    }

    // (/ num1 num2)
    private evalDivide(expr: any[], env: any[]): any {
        const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

        if (num2 === 0) {
            throw "Error: '/' division by zero.";
        }

        return num1 / num2;
    }

    // (% num1 num2)
    private evalModulo(expr: any[], env: any[]): any {
        const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

        return num1 % num2;
    }

    // (= num1 num2 ...)
    private evalEqual(expr: any[], env: any[]): any {
        if (expr.length === 3) {
            const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

            return num1 === num2;
        }

        if (expr.length > 3) {
            const first = this.inter.evalExpr(expr[1], env);

            if ( !this.inter.assertType(first, "number") ) {
                throw `Error: '=' requires number. Given: ${first}`;
            }

            for (let i = 1; i < expr.length; i++) {
                if (this.inter.evalExpr(expr[i], env) !== first) {
                    return false;
                }
            }

            return true
        }

        throw "Error: '=' requires 2 or more arguments. Given: " + (expr.length - 1);
    }

    // (> num1 num2)
    private evalGreater(expr: any[], env: any[]): boolean {
        const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

        return num1 > num2;
    }

    // (< num1 num2)
    private evalLower(expr: any[], env: any[]): boolean {
        const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

        return num1 < num2;
    }

    // (!= num1 num2)
    private evalNotEqual(expr: any[], env: any[]): any {
        const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

        return num1 !== num2;
    }

    // (>= num1 num2)
    private evalGreaterOrEqual(expr: any[], env: any[]): any {
        const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

        return num1 >= num2;
    }

    // (<= num1 num2)
    private evalLowerOrEqual(expr: any[], env: any[]): any {
        const [num1, num2] = <[number, number]>this.inter.evalArgs(["number", "number"], expr, env);

        return num1 <= num2;
    }

    // (~ obj1 obj2 ...)
    private evalAddStrings(expr: any[], env: any[]): string {
        let text: string = "";

        for (let i: number = 1; i < expr.length; i++) {
            text += Printer.stringify( this.inter.evalExpr(expr[i], env) );
        }

        return text;
    }

    // (equal obj1 obj2 ...)
    private evalScalarEqual(expr: any[], env: any[]): any {
        if (expr.length === 3) {
            const [obj1, obj2] = <[any, any]>this.inter.evalArgs(["any", "any"], expr, env);

            return obj1 === obj2;
        }

        if (expr.length > 3) {
            const first = this.inter.evalExpr(expr[1], env);

            for (let i = 1; i < expr.length; i++) {
                if (this.inter.evalExpr(expr[i], env) !== first) {
                    return false;
                }
            }

            return true
        }

        throw "Error: '=' requires 2 or more arguments. Given: " + (expr.length - 1);
    }

    // (not obj)
    private evalNot(expr: any[], env: any[]): boolean {
        const [obj] = <[any]>this.inter.evalArgs(["any"], expr, env);

        return !obj;
    }

    // (to-boolean obj)
    private evalToBoolean(expr: any[], env: any[]): boolean {
        const [obj] = <[any]>this.inter.evalArgs(["any"], expr, env);

        return Boolean(obj);
    }

    // (to-number obj)
    private evalToNumber(expr: any[], env: any[]): number | null {
        const [obj] = <[any]>this.inter.evalArgs(["any"], expr, env);
        const number = Number(obj);

        return isNaN(number) ? null : number;
    }

    // to-string expr)
    private evalToString(expr: any[], env: any[]): string {
        const [obj] = <[any]>this.inter.evalArgs(["any"], expr, env);

        return Printer.stringify(obj);
    }
}
