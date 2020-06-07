"use strict";

class Applicator {
    private readonly interpreter: Interpreter;

    constructor(interpreter: Interpreter) {
        this.interpreter = interpreter;
    }

    // noinspection JSUnusedLocalSymbols
    public getWithNoArgs<T>(value: T,
                            name: string, expr: any[], env: any[]): T {
        if (expr.length !== 1) {
            throw `Error: '${name}' requires 0 arguments. Given: ${expr.length - 1}`;
        }

        return value;
    }

    // noinspection JSUnusedLocalSymbols
    public callWithNoArgs<T>(func: () => T,
                             name: string, expr: any[], env: any[]): T {
        if (expr.length !== 1) {
            throw `Error: '${name}' requires 0 arguments. Given: ${expr.length - 1}`;
        }

        return func();
    }

    public callWithNumber<T>(func: (n: number) => T,
                             name: string, expr: any[], env: any[]): T {
        if (expr.length !== 2) {
            throw `Error: '${name}' requires 1 argument. Given: ${expr.length - 1}`;
        }

        const num: number | any = this.interpreter.evalExpr(expr[1], env);

        if (typeof num !== "number") {
            throw `Error: '${name}' requires a number. Given: ${num}`;
        }

        return func(num);
    }

    public callWithString<T>(func: (s: string) => T,
                             name: string, expr: any[], env: any[]): T {
        if (expr.length !== 2) {
            throw `Error: '${name}' requires 1 argument. Given: ${expr.length - 1}`;
        }

        const str: string | any = this.interpreter.evalExpr(expr[1], env);

        if (typeof str !== "string") {
            throw `Error: '${name}' requires a string. Given: ${str}`;
        }

        return func(str);
    }

    public callWithNumberNumber<T>(func: (m: number, n: number) => T,
                                   name: string, expr: any[], env: any[]): T {
        if (expr.length !== 3) {
            throw `Error: '${name}' requires 2 arguments. Given: ${expr.length - 1}`;
        }

        const num1: number | any = this.interpreter.evalExpr(expr[1], env);
        const num2: number | any = this.interpreter.evalExpr(expr[2], env);

        if (typeof num1 !== "number" || typeof num2 !== "number") {
            throw `Error: '${name}' requires two numbers. Given: ${num1}, ${num2}`;
        }

        return func(num1, num2);
    }

    public callWithStringString<T>(func: (s: string, t: string) => T,
                                   name: string, expr: any[], env: any[]): T {
        if (expr.length !== 3) {
            throw `Error: '${name}' requires 2 arguments. Given: ${expr.length - 1}`;
        }

        const str1: string | any = this.interpreter.evalExpr(expr[1], env);
        const str2: string | any = this.interpreter.evalExpr(expr[2], env);

        if (typeof str1 !== "string" || typeof str2 !== "string") {
            throw `Error: '${name}' requires two strings. Given: ${str1}, ${str2}`;
        }

        return func(str1, str2);
    }

    public callWithStringNumber<T>(func: (s: string, n: number) => T,
                                   name: string, expr: any[], env: any[]): T {
        if (expr.length !== 3) {
            throw `Error: '${name}' requires 2 arguments. Given: ${expr.length - 1}`;
        }

        const str: string | any = this.interpreter.evalExpr(expr[1], env);
        const num: number | any = this.interpreter.evalExpr(expr[2], env);

        if (typeof str !== "string") {
            throw `Error: '${name}' requires a string. Given: ${str}`;
        }

        if (typeof num !== "number") {
            throw `Error: '${name}' requires a number. Given: ${num}`;
        }

        return func(str, num);
    }
}
