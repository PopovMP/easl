"use strict";

class Interpreter {
    private isDebug: boolean;
    private readonly libs: ILib[];
    public readonly infixOperators = ["!=","%","*","+","-","/","<","<=","=",">",">="];

    public options: Options;

    constructor() {
        this.isDebug = false;
        this.libs = [];
        this.options = new Options();
    }

    public evalCodeTree(codeTree: any[], options: Options, callback?: Function): any {
        this.options = options;
        this.libs.push(... LibManager.getBuiltinLibs(options.libs, this));

        if (typeof callback === "function") {
            LibManager.manageImports(codeTree, this.manageImport_ready.bind(this, callback));
        } else {
            return this.evalExprLst(codeTree, []);
        }
    }

    private manageImport_ready(callback: Function, codeTree: any[]): any {
        const res: any = this.evalExprLst(codeTree, []);
        callback(res);
    }

    public evalExprLst(exprLst: any[], env: any[]): void {
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
        }

        // Constructors
        switch (expr[0]) {
            case "list"     : return this.mapExprLst(expr.slice(1), env);
            case "string"   : return this.evalStringConstructor(expr);
        }

        if (this.isDebug) {
            this.isDebug = false;
            this.dumpExpression(expr);
        }

        // Special forms
        switch (expr[0]) {
            case "and"      : return this.evalAnd(expr, env);
            case "block"    : return this.evalBlock(expr, env);
            case "call"     : return this.evalCall(expr, env);
            case "case"     : return this.evalCase(expr, env);
            case "cond"     : return this.evalCond(expr, env);
            case "debug"    : return this.evalDebug(env);
            case "dec"      : return this.evalDecrement(expr, env);
            case "delete"   : return this.evalDelete(expr, env);
            case "do"       : return this.evalDo(expr, env);
            case "enum"     : return this.evalEnum(expr, env);
            case "for"      : return this.evalFor(expr, env);
            case "function" : return this.evalFunction(expr, env);
            case "if"       : return this.evalIf(expr, env);
            case "inc"      : return this.evalIncrement(expr, env);
            case "lambda"   : return this.evalLambda(expr, env);
            case "let"      : return this.evalLet(expr, env);
            case "or"       : return this.evalOr(expr, env);
            case "repeat"   : return this.evalRepeat(expr, env);
            case "set"      : return this.evalSet(expr, env);
            case "throw"    : return this.evalThrow(expr, env);
            case "try"      : return this.evalTry(expr, env);
            case "unless"   : return this.evalUnless(expr, env);
            case "while"    : return this.evalWhile(expr, env);
        }

        if (expr.length === 3 && this.infixOperators.indexOf(expr[1]) > -1) {
            const operator = expr[1];
            expr[1] = Array.isArray(expr[0]) ? expr[0].slice() : expr[0];
            expr[0] = operator;
        }

        const identifier: string = expr[0];

        for (const lib of this.libs) {
            if (lib.builtinHash[identifier]) {
                return lib.libEvalExpr(expr, env);
            }
        }

        return this.callProc(expr, env);
    }

    public isTruthy(value: any): boolean {
        return !this.isFaulty(value);
    }

    public isFaulty(value: any): boolean {
        if (Array.isArray(value) && value.length === 0) return true;
        return !value;
    }

    private lookup(symbol: string, env: any[]): any {
        for (let i = env.length - 1; i > -1; i--) {
            if (symbol === env[i][0]) {
                return env[i][1];
            }
        }

        for (const lib of this.libs) {
            if (lib.builtinHash[symbol]) {
                return symbol;
            }
        }

        throw `Error: Unbound identifier: ${symbol}`;
    }

    private throwOnExistingDef(symbol: string, env: any[]): void {
        for (let i = env.length - 1; i > -1; i--) {
            const cellKey = env[i][0];
            if (cellKey === "#scope#") return;
            if (cellKey === symbol) throw `Error: Identifier already defined: ${symbol}`;
        }
    }

    private setInEnv(symbol: string, value: any, env: any[]): void {
        for (let i = env.length - 1; i > -1; i--) {
            if (symbol === env[i][0]) {
                env[i][1] = value;
                return;
            }
        }

        throw `Error: Unbound identifier: ${symbol}`;
    }

    // [func-id, arg1, arg2, ...]
    // [[lambda, [par1, par2, ...], expr1, expr2, ...], arg1, arg2, ...]
    // [list-id, index, value]
    private callProc(expr: any[], env: any[]): any {
        const proc: string | any[] = expr[0];
        const isNamed: boolean = typeof proc === "string";
        const funcName: string = isNamed ? <string>proc : "lambda";
        const closure: any[] | string = isNamed ? this.lookup(<string>proc, env) : this.evalExpr(proc, env);

        if (typeof closure === "string") {
            const newExpr = expr.slice();
            newExpr[0] = closure;
            return this.evalExpr(newExpr, env);
        }

        if (!Array.isArray(closure)) {throw `Error: Improper function: ${closure}`;}

        return (closure[0] === "closure")
            ? this.callClosure(expr, env, closure, funcName)
            : this.callList(expr, env, closure);
    }

    private callClosure(expr: any[], env: any[], closure: any[], funcName: string) {
        const args: any[] = expr.length === 1 ? [] : expr.length === 2
            ? [this.evalExpr(expr[1], env)]
            : this.mapExprLst(expr.slice(1), env);

        const closureBody: any   = closure[2];
        const closureEnv:  any[] = this.makeClosureEnv(funcName, closure[1], args, closure[3]);

        return this.evalExpr(closureBody, closureEnv);
    }

    private makeClosureEnv(funcName: string, params: string[], args: any[], env: any[]): any[] {
        const closureEnv = env.concat([["#scope#", funcName], ["func-name", funcName], ["func-params", params], ["func-args", args]]);

        for (let i = 0; i < params.length; i++) {
            const param: string = params[i];
            const arg:   any    = i < args.length ? args[i] : null;
            closureEnv.push([param, arg]);
        }

        return closureEnv;
    }

    private callList(expr: any[], env: any[], lst: any[]): any {
        if (expr.length === 1) {
            // Get list length
            return lst.length;
        }

        const index = this.evalExpr(expr[1], env);

        if (index < 0 && index >= lst.length) {
            throw `Error: Index out of range`;
        }

        if (expr.length === 2) {
            // Get list element
            return lst[index];
        }

        if (expr.length === 3) {
            // Set list element
            const val: any = this.evalExpr(expr[2], env);
            lst[index] = val;

            return lst;
        }

        throw `Error: Improper list call`;
    }

    // [string, str1, str2, ...]
    private evalStringConstructor(expr: string[]): string {
        if (expr.length === 1) {
            return "";
        } else if (expr.length === 2) {
            return expr[1].toString();
        } else {
            return expr.slice(1).join(" ");
        }
    }

    // [let, symbol, expr]
    private evalLet(expr: any[], env: any[]): any {
        const symbol: string = expr[1];
        this.throwOnExistingDef(symbol, env);
        const value: any = expr.length === 3
            ? this.evalLetValue(expr, env)
            : null;

        env.push([symbol, value]);

        return value;
    }

    // [set, symbol, expr]
    private evalSet(expr: any[], env: any[]): any {
        const value: any = this.evalLetValue(expr, env);

        this.setInEnv(expr[1], value, env);

        return value;
    }

    // [delete, symbol]
    private evalDelete(expr: any[], env: any[]): any {
        const symbol: string = expr[1];

        for (let i = env.length - 1; i > -1; i--) {
            const cellKey = env[i][0];
            if (cellKey === "#scope#") throw `Error: Unbound identifier: ${symbol}`;
            if (cellKey === symbol) {
                const cellValue = env[i][1];
                env.splice(i, 1);
                return cellValue;
            }
        }

        throw `Error: Unbound identifier: ${symbol}`;
    }

    // [inc, symbol, inc]
    private evalIncrement(expr: any[], env: any[]): any {
        const inc: number = expr.length === 2 ? 1 : this.evalExpr(expr[2], env);
        const value: number = this.evalExpr(expr[1], env) + inc;

        this.setInEnv(expr[1], value, env);

        return value;
    }

    // [dec, symbol, dec]
    private evalDecrement(expr: any[], env: any[]): any {
        const dec: number = expr.length === 2 ? 1 : this.evalExpr(expr[2], env);
        const value: number = this.evalExpr(expr[1], env) - dec;

        this.setInEnv(expr[1], value, env);

        return value;
    }

    // [let, symbol, expr]
    // [let, symbol, [lambda, [par1, par2, ...], expr1, expr2, ...]]
    private evalLetValue(expr: any[], env: any[]): any {
        const letExpr: any = expr[2];

        const res: any = (Array.isArray(letExpr) && letExpr[0] === "lambda")
            ? this.evalLambda(letExpr, env)
            : this.evalExpr(letExpr, env);

        return res;
    }

    // [block, expr1, expr2, ...]
    private evalBlock(expr: any[], env: any[]): any {
        if (expr.length === 1) throw "Error: Empty block";
        env.push(["#scope#", "block"]);

        const res: any = expr.length === 2
            ? this.evalExpr(expr[1], env)
            : this.evalExprLst(expr.slice(1), env);

        this.cleanEnv("#scope#", env);
        return res;
    }

    private cleanEnv(tag: string, env: any[]): void {
        let cell: [string, any];
        do {
            cell = env.pop();
        } while (cell[0] !== tag);
    }

    // [function, symbol, [par1, par2, ...], expr1, expr2, ...]
    private evalFunction(expr: any[], env: any[]): any {
        const symbol: string = expr[1];

        if (expr.length < 4) throw `Error: Improper function: ${symbol}`;
        this.throwOnExistingDef(symbol, env);

        const params: any[] = Array.isArray(expr[2]) ? expr[2] : [expr[2]];
        const body:   any[] = expr.length === 4 ? expr[3] : ["block", ... expr.slice(3)];
        const value:  any   = this.evalLambda(["lambda", params, body], env);

        env.push([symbol, value]);

        if (params.length === 2) {
            this.infixOperators.push(symbol);
        }

        return value;
    }

    // [lambda, [par1, par2, ...], expr1, expr2, ...]
    private evalLambda(expr: any[], env: any[]): any[] {
        if (expr.length < 3) throw "Error: Improper function";

        const params: any[] = Array.isArray(expr[1]) ? expr[1] : [expr[1]];
        const body:   any[] = expr.length === 3 ? expr[2] : ["block", ... expr.slice(2)];

        return ["closure", params, body, env];
    }

    // [if, test-expr, then-expr, else-expr]
    private evalIf(expr: any[], env: any[]): any {
        return this.isTruthy(this.evalExpr(expr[1], env))
            ? this.evalExpr(expr[2], env)
            : expr.length === 4
                ? this.evalExpr(expr[3], env)
                : null;
    }

    // [unless, test-expr, when-not-expr, else-expr]
    private evalUnless(expr: any[], env: any[]): any {
        return this.isFaulty(this.evalExpr(expr[1], env))
            ? this.evalExpr(expr[2], env)
            : expr.length === 4
                ? this.evalExpr(expr[3], env)
                : null;
    }

    // [cond,
    //     [test-expr, expr1, expr2, ...]
    //     ...
    //     [else, expr1, expr2, ...]]
    private evalCond(expr: any, env: any[]): any {
        const clauses: any[] = expr.slice(1);
        env.push(["#scope#", "cond"]);

        for (const clause of clauses) {
            if (clause[0] === "else" || this.evalExpr(clause[0], env)) {
                const res: any = clause.length === 2
                    ? this.evalExpr(clause[1], env)
                    : this.evalExprLst(clause.slice(1), env);
                this.cleanEnv("#scope#", env);
                return res;
            }
        }

        this.cleanEnv("#scope#", env);
        return null;
    }

    // [case, expr,
    //     [[a1, a2, ...] expr],
    //     [[b1, b2, ...] expr],
    //     [else          expr]]
    private evalCase(expr: any, env: any[]): any {
        const val: any = this.evalExpr(expr[1], env);
        const clauses: any[] = expr.slice(2);
        env.push(["#scope#", "case"]);

        for (const clause of clauses) {
            if (clause[0] === "else" || this.evalExpr(clause[0], env).indexOf(val) > -1) {
                const res: any = clause.length === 2
                    ? this.evalExpr(clause[1], env)
                    : this.evalExprLst(clause.slice(1), env);
                this.cleanEnv("#scope#", env);
                return res;
            }
        }

        this.cleanEnv("#scope#", env);
        return null;
    }

    // [for, symbol, range, exp1 exp2 ...]
    private evalFor(expr: any[], env: any[]): null {
        const symbol: string  = expr[1];
        const range: any[]    = this.evalExpr(expr[2], env);
        const loopBody: any[] = expr.slice(3);

        if (!Array.isArray(range))  throw `Error: No range provided in 'for'`;
        if (range.length === 0) return null;

        for (const elem of range) {
            env.push(["#scope#", "for"]);
            env.push([symbol, elem]);

            for (const bodyExpr of loopBody) {
                const res: any = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break") {
                    this.cleanEnv("#scope#", env);
                    return null;
                }
            }

            this.cleanEnv("#scope#", env);
        }

        return null;
    }

    // [while, test-expr, expr1, expr2, ...]
    private evalWhile(expr: any[], env: any[]): null {
        const testExpr: any = expr[1];
        const loopBody: any = expr.slice(2);

        while (this.evalExpr(testExpr, env)) {
            env.push(["#scope#", "while"]);

            for (const bodyExpr of loopBody) {
                const res: any = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break") {
                    this.cleanEnv("#scope#", env);
                    return null;
                }
            }

            this.cleanEnv("#scope#", env);
        }

        return null;
    }

    // [do, expr1, expr2, ..., test-expr]
    private evalDo(expr: any[], env: any[]): null {
        const testExpr: any = expr[expr.length - 1];
        const loopBody: any = expr.slice(1, expr.length - 1);

        do {
            env.push(["#scope#", "do"]);

            for (const bodyExpr of loopBody) {
                const res: any = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break") {
                    this.cleanEnv("#scope#", env);
                    return null;
                }
            }

            this.cleanEnv("#scope#", env);
        } while (this.evalExpr(testExpr, env));

        return null;
    }

    // [enum, symbol1, symbol2, ...]
    private evalEnum(expr: any[], env: any[]): null {
        for (let i: number = 1; i < expr.length; i++) {
            const symbol: string = expr[i];
            this.throwOnExistingDef(symbol, env);
            env.push([symbol, i - 1]);
        }

        return null;
    }

    // [repeat, count expr1, expr2, ...]
    private evalRepeat(expr: any[], env: any[]): null {
        const count: any = this.evalExpr(expr[1], env);
        if (typeof count !== "number")  throw `Error: Wrong count in 'repeat'`;

        const loopBody: any = expr.slice(2);

        for (let i: number = 0; i < count; i++){
            env.push(["#scope#", "repeat"]);

            for (const bodyExpr of loopBody) {
                const res: any = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break") {
                    this.cleanEnv("#scope#", env);
                    return null;
                }
            }

            this.cleanEnv("#scope#", env);
        }

        return null;
    }

    // [call, symbol, [arg1, arg2, ...] | expr]
    private evalCall(expr: any[], env: any[]): any {
        const symbol: string = expr[1];
        const callArgs: any[] = Array.isArray(expr[2]) && expr[2][0] === "list"
            ? expr[2].slice(1)
            : this.evalExpr(expr[2], env);

        for (let i: number = 0; i < callArgs.length; i++) {
            const elm: any = callArgs[i];
            if (typeof elm === "string" &&["true", "false", "null"].indexOf(elm) === -1) {
                callArgs[i] = ["string", elm];
            } else if (elm === true) {
                callArgs[i] = "true";
            } else if (elm === false) {
                callArgs[i] = "false";
            } else if (elm === null) {
                callArgs[i] = "null";
            }
        }

        const proc: any[] = callArgs.length === 0
            ? [symbol]
            : callArgs.length === 1
                ? [symbol, callArgs[0]]
                : [symbol, ...callArgs];

        return this.evalExpr(proc, env);
    }

    private evalAnd(expr: any[], env: any[]): boolean {
        if (expr.length === 1) {
            return true;
        }

        if (expr.length === 2) {
            return this.evalExpr(expr[1], env);
        }

        if (expr.length === 3) {
            const val: any = this.evalExpr(expr[1], env);
            return this.isTruthy(val) ? this.evalExpr(expr[2], env) : val;
        }

        const val: any = this.evalExpr(expr[1], env);
        return this.isTruthy(val) ? this.evalAnd(expr.slice(1), env) : val;
    }

    private evalOr(expr: any[], env: any[]): any {
        if (expr.length === 1) {
            return false;
        }

        if (expr.length === 2) {
            return this.evalExpr(expr[1], env);
        }

        if (expr.length === 3) {
            const val: any = this.evalExpr(expr[1], env);
            return this.isTruthy(val) ? val : this.evalExpr(expr[2], env);
        }

        const val: any = this.evalExpr(expr[1], env);
        return this.isTruthy(val) ? val : this.evalOr(expr.slice(1), env);
    }

    // [try, symbol | expr, expr1, expr2, ...]
    private evalTry(expr: any[], env: any[]): any {
        try {
            env.push(["#scope#", "try"]);
            const res = expr.length === 3
                ? this.evalExpr(expr[2], env)
                : this.evalExprLst(expr.slice(2), env);
            this.cleanEnv("#scope#", env);
            return res;
        } catch (e) {
            this.cleanEnv("#scope#", env);
            return this.evalCatch(expr[1], String(e), env);
        }
    }

    private evalCatch(catchExpr: any, errorMessage: string, env: any[]): any {
        const catchType: string = typeof catchExpr;
        if (catchType === "number") {
            return catchExpr;
        }

        if (catchType === "string") {
            switch (catchExpr) {
                case "null"  : return null;
                case "true"  : return true;
                case "false" : return false;
            }

            // Call function
            return this.callProc([catchExpr, ["string", errorMessage]], env);
        }

        if (Array.isArray(catchExpr)) {
            if (catchExpr[0] === "lambda") {
                return this.callProc([catchExpr, ["string", errorMessage]], env);
            }

            if (catchExpr[0] === "string") {
                return catchExpr[1];
            }
        }

        return this.evalExpr(catchExpr, env);
    }

    // [throw, expr]
    private evalThrow(expr: any[], env: any[]): never {
        throw this.evalExpr(expr[1], env);
    }

    // [debug]
    private evalDebug(env: any): null {
        this.dumpEnvironment(env);
        this.isDebug = true;
        return null;
    }

    private dumpEnvironment(env: any[]): null {
        const getCircularReplacer = () => {
            const seen: object[] = [];
            return (key: string, value: any) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.indexOf(value) > -1) return;
                    seen.push(value);
                }
                return value;
            };
        };

        const envDumpList: string[] = [];
        const maxLength: number = Math.min(env.length - 1, 10);

        for (let i = maxLength; i > -1; i--) {
            const record = env[i];
            envDumpList.push(`${record[0]} : ${JSON.stringify(record[1], getCircularReplacer()).substr(0, 500)}`);
        }

        const envDumpText: string = envDumpList.join("\n      ");
        const message: string = `Env : ${envDumpText}`;

        this.options.printer(message);
        return null;
    }

    private dumpExpression(expr: any[]): null {
        const message: string = `Expr: ${JSON.stringify(expr)}`;

        this.options.printer(message);
        return null;
    }
}
