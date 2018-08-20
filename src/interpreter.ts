"use strict";

class Interpreter {
    private readonly libs: ILib[];
    private isDebug: boolean;

    public print: Function;

    constructor() {
        this.isDebug = false;
        this.print   = console.log;
        this.libs    = [];
    }

    public evalCodeTree(codeTree: any[], options: Options): any {
        this.isDebug = options.isDebug;
        this.print   = options.print;
        this.libs.push( ... LibManager.getBuiltinLibs(options.libs, this));

        return this.evalExprLst(codeTree, []);
    }

    public evalExprLst(exprLst: any[], env: any[]): any {
        let res: any;
        for (const expr of exprLst) {
            res = this.evalExpr(expr, env);
        }
        return res;
    }

    public mapExprLst(exprLst: any[], env: any[]): any[] {
        const res: any[] = [];
        for (const expr of exprLst) {
            res.push(this.evalExpr(expr, env));
        }
        return res;
    }

    public evalExpr(expr: any, env: any[]): any {

        // Constants
        switch (expr) {
            case "null"     : return null;
            case "true"     : return true;
            case "false"    : return false;
            case "break"    : return "break";
            case "continue" : return "continue";
        }

        // Types
        switch (typeof expr) {
            case "number"   : return expr;
            case "string"   : return this.lookup(expr, env);
            case "boolean"  : return expr;
        }

        if (this.isDebug) console.log("evalExpr expr:", JSON.stringify(expr), "env:", JSON.stringify(env));

        // Special forms
        switch (expr[0]) {
            case "list"     : return this.mapExprLst(expr.slice(1), env);
            case "string"   : return expr[1];

            case "let"      : return this.evalLet(expr, env);
            case "set!"     : return this.evalSet(expr, env);
            case "lambda"   : return this.evalLambda(expr, env);
            case "function" : return this.evalFunction(expr, env);
            case "body"    : return this.evalBody(expr, env);

            case "if"       : return this.evalIf(expr, env);
            case "cond"     : return this.evalCond(expr, env);
            case "case"     : return this.evalCase(expr, env);
            case "for"      : return this.evalFor(expr, env);
            case "while"    : return this.evalWhile(expr, env);
            case "do"       : return this.evalDo(expr, env);
        }

        const res: {resolved: boolean, val: any} = this.resolveThroughLib(expr, env);
        if (res.resolved) return res.val;

        return this.callProc(expr, env);
    }

    private lookup(symbol: string, env: any[]): any {
        for (const cell of env) {
            if (symbol === cell[0]) {
                return cell[1];
            }
        }

        throw Error(`Unbound identifier: ${symbol}`);
    }

    private throwOnExistingDef(symbol: string, env: any[]): void {
        for (const cell of env) {
            if (symbol === cell[0]) {
                // ToDo Fix: throw Error(`Identifier already defined: ${symbol}`);
            }
        }
    }

    private setInEnv(symbol: string, value: any, env: any[]): void {
        for (const cell of env) {
            if (symbol === cell[0]) {
                cell[1] = value;
                return;
            }
        }

        throw Error(`Unbound identifier: ${symbol}`);
    }

    // [func-id, arg1, arg2, ...]
    // [[lambda, [par1, par2, ...], expr], arg1, arg2, ...]
    private callProc(expr: any[], env: any[]): any {
        const proc    : string | any[] = expr[0];
        const isNamed : boolean = typeof proc === "string";
        const closure : any[]   = isNamed ? this.lookup(<string>proc, env) : this.evalExpr(proc, env);

        if (!Array.isArray(closure)) {
            throw Error(`Improper function: ${closure}`);
        }

        const args    : any[]   = expr.length === 1
                                      ? []
                                      : expr.length === 2
                                          ? [this.evalExpr(expr[1], env)]
                                          : this.mapExprLst(expr.slice(1), env);

        const funcName   : string   = isNamed ? <string>proc : "lambda";
        const params     : string[] = closure[1];
        const closureBody: any      = closure[2].length === 1 ? closure[2][0] : closure[2];
        const closureEnv : any[]    = this.assocArgsToParams(params, args).concat(env).concat(closure[3])
                         .concat([["func-name", funcName], ["func-params", params], ["func-args", args]]);

        if (closureBody === "body") {
            throw Error(`Improper function: ${funcName}`);
        }

        return this.evalExpr(closureBody, closureEnv);
    }

    private assocArgsToParams(params: string[], args: any[]): [string, any][] {
        const aList: [string, any][] = [];

        for (let i = 0; i < params.length; i++) {
            const arg: any = i < args.length ? args[i] : null;
            aList.push([params[i], arg]);
        }

        return aList;
    }

    // [lambda, [par1, par2, ...], expr]
    private evalLambda(expr: any, env: any[]): any[] {
        return ["closure", expr[1], expr[2], env.slice()];
    }

    private evalLet(expr: any, env: any[]): any {
        const symbol = expr[1];
        this.throwOnExistingDef(symbol, env);
        const value: any = this.evalLetValue(expr, env);

        env.unshift([symbol, value]);

        return value;
    }

    private evalSet(expr: any, env: any[]): any {
        const symbol = expr[1];
        const value: any = this.evalLetValue(expr, env);

        this.setInEnv(symbol, value, env);

        return value;
    }

    private evalBody(expr: any[], env: any[]): any {

        if (expr.length === 1) {
            throw Error(`empty body`);
        }
        return this.evalExprLst(expr.slice(1), env);
    }

    // [let, symbol, expr]
    // [let, symbol, [lambda, [par1, par2, ...], expr]]
    private evalLetValue(expr: any, env: any[]): any {
        const letExpr: any = expr[2];
        const value  : any = (Array.isArray(letExpr) && letExpr[0] === "lambda")
                                ? this.evalLambda(["lambda", letExpr[1], letExpr[2]], env)
                                : this.evalExpr(letExpr, env);
        return value;
    }

    // [function, symbol, [par1, par2, ...], expr]
    // [function, symbol, [par1, par2, ...], expr1, expr2, ...]
    private evalFunction(expr: any[], env: any[]): any {
        const symbol = expr[1];
        this.throwOnExistingDef(symbol, env);

        const body : any = expr.length === 4 ? [expr[3]] : ["body", ... expr.slice(3)];
        const value: any = this.evalLambda(["lambda", expr[2], body], env);

        env.unshift([expr[1], value]);

        return symbol;
    }

    // [if, test-expr, then-expr, else-expr]
    private evalIf(expr: any[], env: any[]): any {
        return this.isTruthy(this.evalExpr(expr[1], env))
                           ? this.evalExpr(expr[2], env)
                           : expr.length === 4
                               ? this.evalExpr(expr[3], env)
                               : null;
    }

    private isTruthy(expr: any): boolean {
        return !this.isFaulty(expr);
    }

    private isFaulty(expr: any): boolean {
        if (Array.isArray(expr) && expr.length === 0) return true;
        return !expr;
    }

    // {cond (test-expr then-body ...)
    //       ...
    //       (else then-body ...) }
    private evalCond(expr: any, env: any[]): any {
        const clauses =  expr.slice(1);

        for (const clause of clauses) {
            if (clause[0] === "else") {
                return this.evalExprLst(clause.slice(1), env);
            }
            if (this.evalExpr(clause[0], env)) {
                return this.evalExprLst(clause.slice(1), env);
            }
        }

        return null;
    }

    // {case expr
    //       ([a1, a2, ...] expr)
    //       ([b1, b2, ...] expr}
    //       (else          expr) }
    private evalCase(expr: any, env: any[]): any {
        const val: any = this.evalExpr(expr[1], env);
        const clauses =  expr.slice(2);

        for (const clause of clauses) {
            if (clause[0] === "else") {
                return this.evalExprLst(clause.slice(1), env);
            }
            if (clause[0].indexOf(val) > -1) {
                return this.evalExprLst(clause.slice(1), env);
            }
        }

        return null;
    }

    // {for (i 0) (< i 10) (+ i 1) exp1 exp2 ...}
    private evalFor(expr: any[], env: any[]): void {
        const condBody: any[] = expr[2];
        const incBody : any[] = expr[3];
        const loopBody: any[] = expr.slice(4);
        const loopEnv : any[] = env;

        const cntId  : string = expr[1][0];
        const cntPair: [string, number] = [cntId, this.evalExpr(expr[1][1], loopEnv)];
        loopEnv.unshift(cntPair);

        const setEnv = () => {
            for (const cell of loopEnv) {
                if (cell[0] === cntId) {
                    cell[1] = cntPair[1];
                    break;
                }
            }
        };

        for (; this.evalExpr(condBody, loopEnv); cntPair[1] = this.evalExpr(incBody, loopEnv)) {
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, loopEnv);
                if (res === "continue") break;
                if (res === "break")    return;
            }
            setEnv();
        }
    }

    // {while, condition, expr1, expr2, ...}
    private evalWhile(expr: any[], env: any[]): void {
        const condBody: any = expr[1];
        const loopBody: any = expr.slice(2);

        while (this.evalExpr(condBody, env)) {
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break")    return;
            }
        }
    }

    // {do, expr1, expr2, ..., condition}
    private evalDo(expr: any[], env: any[]): void {
        const condBody: any = expr[expr.length - 1];
        const loopBody: any = expr.slice(1, expr.length - 1);

        do  {
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break")    return;
            }
        } while (this.evalExpr(condBody, env));
    }

    private resolveThroughLib(expr: any[], env: any[]): {resolved: boolean, val: any} {
        for (const lib of this.libs) {
            const res = lib.libEvalExpr(expr, env);
            if (res !== "##not-resolved##") return {resolved: true, val: res};
        }

        return {resolved: false, val: null};
    }
}
