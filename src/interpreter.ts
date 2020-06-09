"use strict";

class Interpreter {
    private isDebug: boolean;
    private readonly libs: ILib[];

    public options: Options;

    constructor() {
        this.isDebug = false;
        this.libs    = [];
        this.options = new Options();
    }

    public evalCodeTree(codeTree: any[], options: Options, callback?: Function): any {
        this.options = options;
        this.libs.push(... LibManager.getBuiltinLibs(options.libs, this));

        if (typeof callback === "function") {
            LibManager.manageImports(codeTree,
                this.manageImport_ready.bind(this, callback));
        } else {
            return this.evalExprList(codeTree, []);
        }
    }

    private manageImport_ready(callback: Function, codeTree: any[]): any {
        callback( this.evalExprList(codeTree, []) );
    }

    public evalExprList(exprLst: any[], env: any[]): any {
        let res: any;

        for (const expr of exprLst) {
            res = this.evalExpr(expr, env);
        }

        return res;
    }

    public mapExprList(exprLst: any[], env: any[]): any[] {
        const res: any[] = [];

        for (const expr of exprLst) {
            res.push( this.evalExpr(expr, env) );
        }

        return res;
    }

    public evalExpr(expr: any, env: any[]): any {

        // Constants
        switch (expr) {
            case "null"     : return null;
            case "true"     : return true;
            case "false"    : return false;
        }

        // Types
        switch (typeof expr) {
            case "number"   : return expr;
            case "string"   : return this.lookup(expr, env);
        }

        if (expr[0] === undefined) {
            throw "Error: Improper function application. Probably: ()";
        }

        // Constructors
        switch (expr[0]) {
            case "list"     : return this.mapExprList(expr.slice(1), env);
            case "string"   : return this.evalString(expr);
        }

        // Loop controls
        switch (expr[0]) {
            case "break"    : return "break";
            case "continue" : return "continue";
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
            case "dec"      : return this.evalDecrement(expr, env);
            case "if"       : return this.evalIf(expr, env);
            case "inc"      : return this.evalIncrement(expr, env);
            case "lambda"   : return this.evalLambda(expr, env);
            case "or"       : return this.evalOr(expr, env);
            case "quote"    : return this.evalQuote(expr);
            case "try"      : return this.evalTry(expr, env);
        }

        // Special void forms
        switch (expr[0]) {
            case "debug"    : return this.evalDebug(env);
            case "delete"   : return this.evalDelete(expr, env);
            case "do"       : return this.evalDo(expr, env);
            case "enum"     : return this.evalEnum(expr, env);
            case "for"      : return this.evalFor(expr, env);
            case "let"      : return this.evalLet(expr, env);
            case "repeat"   : return this.evalRepeat(expr, env);
            case "set"      : return this.evalSet(expr, env);
            case "when"     : return this.evalWhen(expr, env);
            case "unless"   : return this.evalUnless(expr, env);
            case "throw"    : return this.evalThrow(expr, env);
            case "while"    : return this.evalWhile(expr, env);
        }

        for (const lib of this.libs) {
            if ( lib.builtinHash[expr[0]] ) {
                return lib.libEvalExpr(expr, env);
            }
        }

        return this.callProc(expr, env);
    }

    public isTruthy(value: any): boolean {
        return !this.isFaulty(value);
    }

    public isFaulty(value: any): boolean {
        return (Array.isArray(value) && value.length === 0)
            ? true
            : !value;
    }

    public evalArgs(argTypes: (string | [string, any])[], expr: any[], env: any[]): any[] {
        const optionalCount: number = argTypes.filter( e => Array.isArray(e) ).length;
        this.assertArity(expr, argTypes.length, optionalCount);

        return argTypes.map( (argType: string | [string, any], index: number) => {
            const isRequired =  !Array.isArray(argType);
            const arg: any = isRequired || index + 1 < expr.length
                ? this.evalExpr(expr[index + 1], env)
                : argTypes[index][1];

            this.assertArgType(expr[0], arg, (isRequired ? argType : argType[0]) as string);

            return arg;
        });
    }

    public assertType(arg: any, argType: string): boolean {
        switch (argType) {
            case "any":
                return true;
            case "array":
                return Array.isArray(arg);
            case "scalar":
                return arg === null ||
                    ["string", "number", "boolean"].includes(typeof arg);
            default:
                return typeof arg === argType;
        }
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

    private setInEnv(symbol: string, value: any, env: any[]): void {
        if (typeof value === "undefined") {
            throw `Error: cannot set unspecified value to symbol: ${symbol}.`;
        }

        for (let i = env.length - 1; i > -1; i--) {
            if (symbol === env[i][0]) {
                env[i][1] = value;
                return;
            }
        }

        throw `Error: Unbound identifier: ${symbol}`;
    }

    private addToEnv(symbol: string, value: any, env: any[]): void {
        this.throwOnExistingDef(symbol, env);

        if (typeof value === "undefined") {
            throw `Error: cannot set unspecified value to symbol: ${symbol}.`;
        }

        env.push([symbol, value]);
    }

    private throwOnExistingDef(symbol: string, env: any[]): void {
        for (let i = env.length - 1; i > -1; i--) {
            const cellKey = env[i][0];

            if (cellKey === "#scope") {
                return;
            }

            if (cellKey === symbol) {
                throw `Error: Identifier already defined: ${symbol}`;
            }
        }
    }

    // [func-id, arg1, arg2, ...]
    // [[lambda, [par1, par2, ...], expr1, expr2, ...], arg1, arg2, ...]
    private callProc(expr: any[], env: any[]): any {
        const proc: string | any[] = expr[0];
        const isNamed: boolean = typeof proc === "string";
        const funcName: string = isNamed ? <string>proc : proc[0];
        const closure: any[] | string = isNamed
            ? this.lookup(<string>proc, env)
            : this.evalExpr(proc, env);

        if (typeof closure === "string") {
            const newExpr = expr.slice();
            newExpr[0] = closure;
            return this.evalExpr(newExpr, env);
        }

        if (!Array.isArray(closure))  {throw `Error: Improper function: ${closure}`;}
        if (closure[0] !== "closure") {throw `Error: Improper function application`;}

        return this.callClosure(expr, env, closure, funcName);
    }

    private callClosure(expr: any[], env: any[], closure: any[], funcName: string) {
        const args: any[] = expr.length === 1 ? [] : expr.length === 2
            ? [this.evalExpr(expr[1], env)]
            : this.mapExprList(expr.slice(1), env);

        const closureBody: any   = closure[2];
        const closureEnv:  any[] = this.makeClosureEnv(funcName, closure[1], args, closure[3]);

        return this.evalExpr(closureBody, closureEnv);
    }

    private makeClosureEnv(name: string, params: string[], args: any[], env: any[]): any[] {
        const closureEnv = env.concat([["#scope", name], ["#args", args], ["#name", name]]);

        this.evalListDestructuring(params, args, closureEnv);

        return closureEnv;
    }

    // [string, text]
    private evalString(expr: string[]): string {
        if (expr.length !== 2) {
            throw "Error: 'string' requires 1 argument. Given: " + (expr.length - 1);
        }

        return expr[1];
    }

    // [let, [arg1, arg2, ...], [par1, par2, ...]]
    // [let, symbol, expr]
    // [let, symbol, [par1, par2, ...], expr1, expr2, ...]
    private evalLet(expr: any[], env: any[]): void {
        if (expr.length === 3 && Array.isArray(expr[1])) {
            this.evalListDestructuring(expr[1], this.evalExpr(expr[2], env), env);
            return;
        }

        if ( !Array.isArray(expr[2]) && expr.length !== 3 ) {
            throw "Error: 'let' requires a symbol and a value.";
        }

        const param: any = expr.length === 3
            ? expr[2]
            : ["lambda", expr[2], ...expr.slice(3)];

        const value: any = this.evalExpr(param, env);

        this.addToEnv(expr[1], value, env);
    }

    private evalListDestructuring(params: any[], args: any[], env: any[]): void {
        if ( !Array.isArray(args) ) {
            throw "Error: list destructuring requires one iterable argument.";
        }

        const restIndex: number = params.indexOf(".");

        for (let i: number = 0; i < params.length && i !== restIndex; i++) {
            const isParamArray: boolean = Array.isArray(params[i]);
            const param :string = isParamArray ? params[i][0] : params[i];
            const value: any    = typeof args[i] === "undefined"
                ? isParamArray
                    ? this.evalExpr(params[i][1], env)
                    : `Error: cannot set unspecified value to parameter: ${param}.`
                : args[i];

            this.addToEnv(param, value, env);
        }

        if (restIndex > -1) {
            const param :string = params[restIndex + 1];
            const value: any    = args.length < restIndex
                ? []
                : args.slice(restIndex);

            this.addToEnv(param, value, env);
        }
    }

    // [set, symbol, expr]
    private evalSet(expr: any[], env: any[]): void {
        if (expr.length !== 3) {
            throw "Error: 'set' requires 2 arguments. Given: " + (expr.length - 1);
        }

        const value: any = this.evalExpr(expr[2], env);

        this.setInEnv(expr[1], value, env);
    }

    // [delete, symbol]
    private evalDelete(expr: any[], env: any[]): void {
        if (expr.length !== 2) {
            throw "Error: 'delete' requires 1 argument. Given: " + (expr.length - 1);
        }

        const symbol: string = expr[1];

        for (let i = env.length - 1; i > -1; i--) {
            const cellKey = env[i][0];
            if (cellKey === "#scope") throw `Error: 'delete' unbound identifier: ${symbol}`;
            if (cellKey === symbol) {
                env.splice(i, 1);
                return;
            }
        }

        throw `Error: 'delete' unbound identifier: ${symbol}`;
    }

    // [inc, symbol, delta]
    private evalIncrement(expr: any[], env: any[]): any {
        if (expr.length === 1 || expr.length > 3) {
            throw "Error: 'inc' requires 1 or 2 arguments. Given: " + (expr.length - 1);
        }

        if (typeof expr[1] !== "string") {
            throw "Error: 'inc' requires a symbol. Given: " + expr[1];
        }

        const delta: number | any = expr.length === 2
            ? 1
            : this.evalExpr(expr[2], env);

        if (typeof delta !== "number") {
            throw "Error: 'inc' delta must be a number. Given: " + delta;
        }

        const initialValue: number | any = this.lookup(expr[1], env);

        if (typeof initialValue !== "number") {
            throw "Error: 'inc' initial value must be a number. Given: " + initialValue;
        }

        const value: number = initialValue + delta;

        this.setInEnv(expr[1], value, env);

        return value;
    }

    // [dec, symbol, delta]
    private evalDecrement(expr: any[], env: any[]): any {
        if (expr.length === 1 || expr.length > 3) {
            throw "Error: 'dec' requires 1 or 2 arguments. Given: " + (expr.length - 1);
        }

        if (typeof expr[1] !== "string") {
            throw "Error: 'dec' requires a symbol. Given: " + expr[1];
        }

        const delta: number | any = expr.length === 2
            ? 1
            : this.evalExpr(expr[2], env);

        if (typeof delta !== "number") {
            throw "Error: 'dec' delta must be a number. Given: " + delta;
        }

        const initialValue: number | any = this.lookup(expr[1], env);

        if (typeof initialValue !== "number") {
            throw "Error: 'dec' initial value must be a number. Given: " + initialValue;
        }

        const value: number = initialValue - delta;

        this.setInEnv(expr[1], value, env);

        return value;
    }

    // [block, expr1, expr2, ...]
    private evalBlock(expr: any[], env: any[]): any {
        if (expr.length === 1) throw "Error: Empty block";
        env.push(["#scope", "block"]);

        const res: any = expr.length === 2
            ? this.evalExpr(expr[1], env)
            : this.evalExprList(expr.slice(1), env);

        this.clearEnv("#scope", env);
        return res;
    }

    private clearEnv(tag: string, env: any[]): void {
        let cell: [string, any];
        do {
            cell = env.pop();
        } while (cell[0] !== tag);
    }

    // [lambda, [par1, par2, ...], expr1, expr2, ...]
    private evalLambda(expr: any[], env: any[]): any[] {
        if (expr.length < 3) throw "Error: Improper function";
        if (!Array.isArray(expr[1])) throw "Error: Improper function parameters";

        const params: any[] = expr[1];
        const body:   any[] = expr.length === 3 ? expr[2] : ["block", ... expr.slice(2)];

        return ["closure", params, body, env];
    }

    // [if, test-expr, then-expr, else-expr]
    private evalIf(expr: any[], env: any[]): any {
        if (expr.length < 3 || expr.length > 4) {
            throw "Error: 'if' requires 2 or 3 arguments. Given: " + (expr.length - 1);
        }

        return this.isTruthy(this.evalExpr(expr[1], env))
            ? this.evalExpr(expr[2], env)
            : expr.length === 4
                ? this.evalExpr(expr[3], env)
                : undefined;
    }

    // [unless, test-expr, when-not-expr, else-expr]
    private evalUnless(expr: any[], env: any[]): void {
        if (expr.length === 1) {
            throw "Error: Empty 'unless'";
        }

        if (expr.length === 2) {
            throw "Error: Empty 'unless' block";
        }

        if ( this.isTruthy( this.evalExpr(expr[1], env) )) {
            return;
        }

        env.push(["#scope", "unless"]);

        if (expr.length === 3) {
            this.evalExpr(expr[2], env);
        } else {
            this.evalExprList(expr.slice(2), env);
        }

        this.clearEnv("#scope", env);
    }

    // [when, test-expr, expr1, expr2, ...]
    private evalWhen(expr: any[], env: any[]): void {
        if (expr.length === 1) {
            throw "Error: Empty 'when'";
        }

        if (expr.length === 2) {
            throw "Error: Empty 'when' block";
        }

        if ( !this.isTruthy( this.evalExpr(expr[1], env) )) {
            return;
        }

        env.push(["#scope", "when"]);

        if (expr.length === 3) {
            this.evalExpr(expr[2], env);
        } else {
            this.evalExprList(expr.slice(2), env);
        }

        this.clearEnv("#scope", env);
    }

    // [cond,
    //     [test-expr, expr1, expr2, ...]
    //     ...
    //     [else, expr1, expr2, ...]]
    private evalCond(expr: any, env: any[]): any {
        const clauses: any[] = expr.slice(1);
        env.push(["#scope", "cond"]);

        for (const clause of clauses) {
            if (clause[0] === "else" || this.evalExpr(clause[0], env)) {
                const res: any = clause.length === 2
                    ? this.evalExpr(clause[1], env)
                    : this.evalExprList(clause.slice(1), env);
                this.clearEnv("#scope", env);
                return res;
            }
        }

        this.clearEnv("#scope", env);

        return undefined;
    }

    // [case, expr,
    //     [[a1, a2, ...] expr],
    //     [[b1, b2, ...] expr],
    //     [els           expr] ]
    private evalCase(expr: any, env: any[]): any {
        const key: any       = this.evalExpr(expr[1], env);
        const clauses: any[] = expr.slice(2);

        for (const clause of clauses) {
            const datum: any[] | string = clause[0];
            if (!Array.isArray(datum) && datum !== "else") {
                throw `Error: 'case' requires datum to be in a list. Given: ${Printer.stringify(datum)}`;
            }
            if (clause.length <= 1) {
                throw `Error: 'case' requires a clause with one or more expressions.`;
            }

            const isMatch = datum === "else" ||
                datum.some((e:any|any[]) => e === key || (e[0] === "string" && e[1] === key));

            if (isMatch) {
                env.push(["#scope", "case"]);
                const res: any = clause.length === 2
                        ? this.evalExpr(clause[1], env)
                        : this.evalExprList(clause.slice(1), env);
                this.clearEnv("#scope", env);
                return res;
            }
        }

        return undefined;
    }

    // [for, symbol, range, exp1 exp2 ...]
    private evalFor(expr: any[], env: any[]): void {
        const symbol: string  = expr[1];
        const range: any[]    = this.evalExpr(expr[2], env);
        const loopBody: any[] = expr.slice(3);

        if ( !Array.isArray(range) ) {
            throw `Error: No range provided in 'for'`;
        }

        for (const elem of range) {
            env.push(["#scope", "for"]);
            this.addToEnv(symbol, elem, env);

            for (const bodyExpr of loopBody) {
                const res: any = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break") {
                    this.clearEnv("#scope", env);
                    return;
                }
            }

            this.clearEnv("#scope", env);
        }
    }

    // [while, test-expr, expr1, expr2, ...]
    private evalWhile(expr: any[], env: any[]): void {
        const testExpr: any = expr[1];
        const loopBody: any = expr.slice(2);

        while (this.evalExpr(testExpr, env)) {
            env.push(["#scope", "while"]);

            for (const bodyExpr of loopBody) {
                const res: any = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break") {
                    this.clearEnv("#scope", env);
                    return;
                }
            }

            this.clearEnv("#scope", env);
        }
    }

    // [do, expr1, expr2, ..., test-expr]
    private evalDo(expr: any[], env: any[]): void {
        const testExpr: any = expr[expr.length - 1];
        const loopBody: any = expr.slice(1, expr.length - 1);

        do {
            env.push(["#scope", "do"]);

            for (const bodyExpr of loopBody) {
                const res: any = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break") {
                    this.clearEnv("#scope", env);
                    return;
                }
            }

            this.clearEnv("#scope", env);
        } while (this.evalExpr(testExpr, env));
    }

    // [enum, symbol1, symbol2, ...]
    private evalEnum(expr: any[], env: any[]): void {
        for (let i: number = 1; i < expr.length; i++) {
            const symbol: string = expr[i];
            this.addToEnv(symbol, i - 1, env);
        }
    }

    // [repeat, count expr1, expr2, ...]
    private evalRepeat(expr: any[], env: any[]): void {
        const count: any = this.evalExpr(expr[1], env);
        if (typeof count !== "number")  throw `Error: Wrong count in 'repeat'`;

        const loopBody: any = expr.slice(2);

        for (let i: number = 0; i < count; i++){
            env.push(["#scope", "repeat"]);

            for (const bodyExpr of loopBody) {
                const res: any = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break") {
                    this.clearEnv("#scope", env);
                    return;
                }
            }

            this.clearEnv("#scope", env);
        }
    }

    // [call, symbol, [arg1, arg2, ...] | expr]
    private evalCall(expr: any[], env: any[]): any {
        const procId: string = expr[1];
        const callArgs: any[] = Array.isArray(expr[2]) && expr[2][0] === "list"
            ? expr[2].slice(1)
            : this.evalExpr(expr[2], env);

        for (let i: number = 0; i < callArgs.length; i++) {
            const elm: any = callArgs[i];
            if (typeof elm === "string" && !["true", "false", "null"].includes(elm) ) {
                callArgs[i] = ["string", elm];
            } else if (elm === true) {
                callArgs[i] = "true";
            } else if (elm === false) {
                callArgs[i] = "false";
            } else if (elm === null) {
                callArgs[i] = "null";
            }
        }

        return this.evalExpr([procId, ...callArgs], env);
    }

    // [and] => true
    // [and, expr] => expr
    // [and, expr1, expr2, ...] => the first faulty or the last one
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

    // [quote, obj] => obj
    private evalQuote(expr: any[]): any {
        if (expr.length !== 2) {
            throw "Error: 'quote' requires 1 argument. Given: " + (expr.length - 1);
        }

        return expr[1];
    }

    // [or] => false
    // [or, expr] => expr
    // [or, expr1, expr2, ...] => the first truthy or the last one
    private evalOr(expr: any[], env: any[]): any {

        switch (expr.length) {
            case 1:
                return false;
            case 2:
                return this.evalExpr(expr[1], env);
            case 3:
                const val: any = this.evalExpr(expr[1], env);
                return this.isTruthy(val)
                    ? val
                    : this.evalExpr(expr[2], env);
        }

        const val: any = this.evalExpr(expr[1], env);
        return this.isTruthy(val)
            ? val
            : this.evalOr(expr.slice(1), env);
    }

    // [try, symbol | expr, expr1, expr2, ...]
    private evalTry(expr: any[], env: any[]): any {
        try {
            env.push(["#scope", "try"]);
            const res = expr.length === 3
                ? this.evalExpr(expr[2], env)
                : this.evalExprList(expr.slice(2), env);
            this.clearEnv("#scope", env);
            return res;
        } catch (e) {
            this.clearEnv("#scope", env);
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
    private evalDebug(env: any): void {
        this.dumpEnvironment(env);
        this.isDebug = true;
    }

    private dumpEnvironment(env: any[]): void {
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

        this.options.printer( `Env : ${envDumpList.join("\n      ")}` );
    }

    private dumpExpression(expr: any[]): void {
        this.options.printer( `Expr: ${JSON.stringify(expr)}` );
    }

    private assertArity(expr: any[], argsCount: number, optionalCount: number): void {
        const argText = (count: number) => count === 1
            ? "1 argument"
            : count + " arguments";

        if (optionalCount === 0 && expr.length !== argsCount + 1) {
            throw `Error: '${expr[0]}' requires ${argText(argsCount)}. Given: ${argText(expr.length - 1)}`;
        } else if (optionalCount !== 0 &&
            (expr.length  - 1 < argsCount - optionalCount || expr.length - 1 > argsCount)) {
            throw `Error: '${expr[0]}' requires from ${argText(argsCount - optionalCount)} to ${argText(argsCount)}.` +
            ` Given: ${argText(expr.length - 1)}`;
        }
    }

    private assertArgType(name: string, arg: any, argType: string): void {
        if ( !this.assertType(arg, argType) ) {
            throw `Error: '${name}' requires ${argType}. Given: ${typeof arg} ${this.argToStr(arg)}`;
        }
    }

    private argToStr(arg: any): string {
        const maxLength: number = 25;
        const argText: string   = Printer.stringify(arg);
        return argText.length > maxLength
            ? argText.substring(0, maxLength) + "..."
            : argText;
    }
}
