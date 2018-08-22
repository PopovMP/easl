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
        this.libs.push( ... LibManager.getBuiltinLibs(options.libs, this));

        if (typeof callback === "function") {
            this.manageImports(codeTree, this.manageImport_ready.bind(this, callback));
        } else {
            return this.evalExprLst(codeTree, []);
        }
    }

    private  manageImport_ready(callback: Function, codeTree: any[]): any {
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
            case "boolean"  : return expr;
        }

        if (this.isDebug) {
            this.dumpState(expr, env);
        }

        // Special forms
        switch (expr[0]) {
            case "list"     : return this.mapExprLst(expr.slice(1), env);
            case "string"   : return expr[1];
            case "let"      : return this.evalLet(expr, env);
            case "set!"     : return this.evalSet(expr, env);
            case "lambda"   : return this.evalLambda(expr, env);
            case "function" : return this.evalFunction(expr, env);
            case "block"    : return this.evalBlock(expr, env);
            case "if"       : return this.evalIf(expr, env);
            case "cond"     : return this.evalCond(expr, env);
            case "case"     : return this.evalCase(expr, env);
            case "for"      : return this.evalFor(expr, env);
            case "while"    : return this.evalWhile(expr, env);
            case "do"       : return this.evalDo(expr, env);
            case "debug"    : return this.evalDebug();
        }

        const res: {resolved: boolean, val: any} = this.resolveThroughLib(expr, env);
        if (res.resolved) return res.val;

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
        const closureEnv : any[]    = this.assocArgsToParams(params, args)
                                    .concat([["func-name", funcName], ["func-params", params], ["func-args", args]])
                                    .concat(env).concat(closure[3]);

        if (closureBody === "block") {
            throw Error(`Improper function: ${funcName}`);
        }

        if (closureBody.length === 0) {
            throw Error(`Function with empty body: ${funcName}`);
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

    private evalBlock(expr: any[], env: any[]): any {
        if (expr.length === 1) {
            throw Error(`Empty body`);
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

        const body : any = expr.length === 4 ? [expr[3]] : ["block", ... expr.slice(3)];
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
    private evalFor(expr: any[], env: any[]): null {
        const condBody: any[] = expr[2];
        const incBody : any[] = expr[3];
        const loopBody: any[] = expr.slice(4);
        const loopEnv : any[] = env;

        const cntId  : string = expr[1][0];
        const cntPair: [string, number] = [cntId, this.evalExpr(expr[1][1], loopEnv)];
        loopEnv.unshift(cntPair);

        while (this.evalExpr(condBody, loopEnv)) {
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, loopEnv);
                if (res === "continue") break;
                if (res === "break"   ) return null;
            }

            for (const cell of loopEnv) {
                if (cell[0] === cntId) {
                    cell[1] = this.evalExpr(incBody, loopEnv);
                    break;
                }
            }
        }

        return null;
    }

    // {while, condition, expr1, expr2, ...}
    private evalWhile(expr: any[], env: any[]): null {
        const condBody: any = expr[1];
        const loopBody: any = expr.slice(2);

        while (this.evalExpr(condBody, env)) {
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break"   ) return null;
            }
        }

        return null;
    }

    // {do, expr1, expr2, ..., condition}
    private evalDo(expr: any[], env: any[]): null {
        const condBody: any = expr[expr.length - 1];
        const loopBody: any = expr.slice(1, expr.length - 1);

        do  {
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break"   ) return null;
            }
        } while (this.evalExpr(condBody, env));

        return null;
    }

    private evalDebug(): null {
        this.isDebug = true;
        return null;
    }

    private dumpState(expr: any[], env: any[]): null {
        const envDumpList: string[] = [];
        const maxLength= Math.min(env.length, 10);

        for (let i = 0; i < maxLength; i++) {
            const record = env[i];
            envDumpList.push(`${record[0]} : ${JSON.stringify(record[1]).substr(0, 500)}`);
        }

        const envDumpText = envDumpList.join("\n      ");
        const message     = `Expr: ${JSON.stringify(expr)}\nEnv : ${envDumpText}`;

        this.options.printer(message);
        this.isDebug = false;

        return null;
    }

    private manageImports(codeTree: any[], callback: (codeTree: any[]) => void): void {
        const code: any[] = [];
        let currentCodeIndex = 0;

        searchImports(currentCodeIndex);

        function searchImports(index: number): void {
            for (let i = index; i < codeTree.length; i++) {
                const expr: any = codeTree[i];
                if (Array.isArray(expr) && expr[0] === "import") {
                    currentCodeIndex = i;
                    const libUrl: string = expr[1][1];
                    LibManager.importLibrary(libUrl, libManager_import_ready);
                    return;
                } else {
                    code.push(expr);
                }
            }

            callback(code);
        }

        function libManager_import_ready(libCodeTree: any[]) :void {
            code.push(... libCodeTree);
            searchImports(currentCodeIndex + 1);
        }
    }

    private resolveThroughLib(expr: any[], env: any[]): {resolved: boolean, val: any} {
        for (const lib of this.libs) {
            const res = lib.libEvalExpr(expr, env);
            if (res !== "##not-resolved##") return {resolved: true, val: res};
        }

        return {resolved: false, val: null};
    }
}
