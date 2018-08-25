"use strict";

class Interpreter {
    private isDebug: boolean;
    private readonly libs: ILib[];

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
            this.manageImports(codeTree, this.manageImport_ready.bind(this, callback));
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

        switch (expr[0]) {
            case "list"     : return this.mapExprLst(expr.slice(1), env);
            case "string"   : return expr[1];
        }

        if (this.isDebug) {
            this.dumpState(expr, env);
        }

        // Special forms
        switch (expr[0]) {
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

        const res: { resolved: boolean, val: any } = this.resolveThroughLib(expr, env);
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
        for (let i = env.length - 1; i > -1; i--) {
            if (symbol === env[i][0]) {
                return env[i][1];
            }
        }

        throw Error(`Unbound identifier: ${symbol}`);
    }

    private throwOnExistingDef(symbol: string, env: any[]): void {
        for (let i = env.length - 1; i > -1; i--) {
            const cellKey = env[i][0];
            if (cellKey === "#scope#") return;
            if (cellKey === symbol) throw Error(`Identifier already defined: ${symbol}`);
        }
    }

    private setInEnv(symbol: string, value: any, env: any[]): void {
        for (let i = env.length - 1; i > -1; i--) {
            if (symbol === env[i][0]) {
                env[i][1] = value;
                return;
            }
        }

        throw Error(`Unbound identifier: ${symbol}`);
    }

    // [func-id, arg1, arg2, ...]
    // [[lambda, [par1, par2, ...], expr], arg1, arg2, ...]
    private callProc(expr: any[], env: any[]): any {
        const proc: string | any[] = expr[0];
        const isNamed: boolean = typeof proc === "string";
        const closure: any[] = isNamed ? this.lookup(<string>proc, env) : this.evalExpr(proc, env);

        if (!Array.isArray(closure)) {
            throw Error(`Improper function: ${closure}`);
        }

        const funcName: string = isNamed ? <string>proc : "lambda";

        const closureBody: any[] | string = closure[2].length === 1 && typeof closure[2][0] === "string"
            ? closure[2][0]
            : closure[2];

        if (closureBody === "block") {
            throw Error(`Improper function: ${funcName}`);
        }

        if (closureBody.length === 0 || (closureBody[0] === "block" && closureBody[1].length === 0)) {
            throw Error(`Function with empty body: ${funcName}`);
        }

        const args: any[] = expr.length === 1 ? [] : expr.length === 2
            ? [this.evalExpr(expr[1], env)]
            : this.mapExprLst(expr.slice(1), env);
        const closureEnv: any[] = this.makeProcEnv(funcName, closure[1], args, closure[3]);

        return this.evalExpr(closureBody, closureEnv);
    }

    private makeProcEnv(funcName: string, params: string | string[], args: any[], env: any[]): any[] {
        const closureEnv = env.concat([["func-name", funcName], ["func-params", params], ["func-args", args]]);

        if (typeof params === "string") {
            closureEnv.push([params, args.length > 0 ? args[0] : null]);
        } else {
            for (let i = 0; i < params.length; i++) {
                closureEnv.push([params[i], i < args.length ? args[i] : null]);
            }
        }

        return closureEnv;
    }

    // [lambda, [par1, par2, ...], expr]
    private evalLambda(expr: any[], env: any[]): any[] {
        if (expr.length !== 3) {
            throw Error(`Improper function`);
        }

        return ["closure", expr[1], expr[2], env];
    }

    private evalLet(expr: any, env: any[]): any {
        const symbol: string = expr[1];
        this.throwOnExistingDef(symbol, env);
        const value: any = this.evalLetValue(expr, env);

        env.push([symbol, value]);

        return null;
    }

    private evalSet(expr: any, env: any[]): any {
        const symbol: string = expr[1];
        const value: any = this.evalLetValue(expr, env);

        this.setInEnv(symbol, value, env);

        return null;
    }

    // {block, expr1, expr2, ...}
    private evalBlock(expr: any[], env: any[]): any {
        if (expr.length === 1) {
            throw Error(`Empty body`);
        }

        env.push(["#scope#", null]);

        const res = expr.length === 2
            ? this.evalExpr(expr[1], env)
            : this.evalExprLst(expr.slice(1), env);

        this.cleanEnv("#scope#", env);

        return res;
    }

    private cleanEnv(tag: string, env: any[]): void {
        let slice = [];
        do {
            slice = env.pop();
        } while (slice[0] !== tag);
    }

    // [let, symbol, expr]
    // [let, symbol, [lambda, [par1, par2, ...], expr]]
    private evalLetValue(expr: any, env: any[]): any {
        const letExpr: any = expr[2];
        const value: any = (Array.isArray(letExpr) && letExpr[0] === "lambda")
            ? this.evalLambda(["lambda", letExpr[1], letExpr[2]], env)
            : this.evalExpr(letExpr, env);
        return value;
    }

    // [function, symbol, [par1, par2, ...], expr]
    // [function, symbol, [par1, par2, ...], expr1, expr2, ...]
    private evalFunction(expr: any[], env: any[]): any {
        const symbol: string = expr[1];
        this.throwOnExistingDef(symbol, env);

        const body: any = ["block", ... expr.slice(3)];
        const value: any = this.evalLambda(["lambda", expr[2], body], env);

        env.push([symbol, value]);

        return null;
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
        const clauses: any[] = expr.slice(1);
        env.push(["#scope#", null]);

        for (const clause of clauses) {
            if (clause[0] === "else" || this.evalExpr(clause[0], env)) {
                const res: any = this.evalExprLst(clause.slice(1), env);
                this.cleanEnv("#scope#", env);
                return res;
            }
        }

        this.cleanEnv("#scope#", env);
        return null;
    }

    // {case expr
    //       ([a1, a2, ...] expr)
    //       ([b1, b2, ...] expr}
    //       (else          expr) }
    private evalCase(expr: any, env: any[]): any {
        const val: any = this.evalExpr(expr[1], env);
        const clauses: any[] = expr.slice(2);
        env.push(["#scope#", null]);

        for (const clause of clauses) {
            if (clause[0] === "else" || clause[0].indexOf(val) > -1) {
                const res: any = this.evalExprLst(clause.slice(1), env);
                this.cleanEnv("#scope#", env);
                return res;
            }
        }

        this.cleanEnv("#scope#", env);
        return null;
    }

    // {for (i 0) (< i 10) (+ i 1) exp1 exp2 ...}
    private evalFor(expr: any[], env: any[]): null {
        const condBody: any[]  = expr[2];
        const incBody : any[]  = expr[3];
        const loopBody: any[]  = expr.slice(4);
        const cntId   : string = expr[1][0];

        env.push([cntId, this.evalExpr(expr[1][1], env)]);

        while (this.evalExpr(condBody, env)) {
            env.push(["#scope#", null]);

            for (const bodyExpr of loopBody) {
                const res: any = this.evalExpr(bodyExpr, env);

                if (res === "continue") break;
                if (res === "break") {
                    this.cleanEnv("#scope#", env);
                    env.pop();
                    return null;
                }
            }

            for (let i = env.length - 1; i > -1; i--) {
                if (env[i][0] === cntId) {
                    env[i][1] = this.evalExpr(incBody, env);
                    break;
                }
            }

            this.cleanEnv("#scope#", env);
        }

        env.pop();
        return null;
    }

    // {while, condition, expr1, expr2, ...}
    private evalWhile(expr: any[], env: any[]): null {
        const condBody: any = expr[1];
        const loopBody: any = expr.slice(2);

        while (this.evalExpr(condBody, env)) {
            env.push(["#scope#", null]);

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

    // {do, expr1, expr2, ..., condition}
    private evalDo(expr: any[], env: any[]): null {
        const condBody: any = expr[expr.length - 1];
        const loopBody: any = expr.slice(1, expr.length - 1);

        do {
            env.push(["#scope#", null]);

            for (const bodyExpr of loopBody) {
                const res: any = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break") {
                    this.cleanEnv("#scope#", env);
                    return null;
                }
            }

            this.cleanEnv("#scope#", env);
        } while (this.evalExpr(condBody, env));

        return null;
    }

    private evalDebug(): null {
        this.isDebug = true;
        return null;
    }

    private dumpState(expr: any[], env: any[]): null {
        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key: string, value: any) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) return;
                    seen.add(value);
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
        const message: string = `Expr: ${JSON.stringify(expr)}\nEnv : ${envDumpText}`;

        this.options.printer(message);

        this.isDebug = false;
        return null;
    }

    private manageImports(codeTree: any[], callback: (codeTree: any[]) => void): void {
        const code: any[] = [];
        let currentCodeIndex: number = 0;

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

        function libManager_import_ready(libCodeTree: any[]): void {
            code.push(... libCodeTree);
            searchImports(currentCodeIndex + 1);
        }
    }

    private resolveThroughLib(expr: any[], env: any[]): { resolved: boolean, val: any } {
        for (const lib of this.libs) {
            const res: any = lib.libEvalExpr(expr, env);
            if (res !== "##not-resolved##") {
                return {resolved: true, val: res};
            }
        }

        return {resolved: false, val: null};
    }
}
