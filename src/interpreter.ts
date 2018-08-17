"use strict";

class Interpreter {
    private readonly libs: ILib[];
    private isDebug: boolean;

    public print: Function;

    constructor() {
        this.isDebug = false;
        this.print   = console.log;

        this.libs = [];
        this.libs.push(new CoreLib(this));
        this.libs.push(new SchemeLib(this));
        this.libs.push(new ListLib(this));
        this.libs.push(new StringLib(this));
        this.libs.push(new MathLib(this));
        this.libs.push(new NumberLib(this));
    }

    public evalCodeTree(codeTree: any[], options: Options): any {
        this.isDebug = options.isDebug;
        this.print   = options.print;

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
        if (this.isDebug) console.log("evalExpr expr:", JSON.stringify(expr), "env:", JSON.stringify(env));

        // Constants
        if (expr === "null")  return null;
        if (expr === "true")  return true;
        if (expr === "false") return false;

        if (typeof expr === "number") return expr;
        if (typeof expr === "string") return this.lookup(expr, env);

        switch (expr[0]) {
            case "list"     : return this.mapExprLst(expr.slice(1), env);
            case "string"   : return expr[1];

            case "let"      : return this.evalLet(expr, env);
            case "set!"     : return this.evalSet(expr, env);
            case "lambda"   : return this.evalLambda(expr, env);
            case "function" : return this.evalFunction(expr, env);

            case "if"       : return this.evalIf(expr, env);
            case "cond"     : return this.evalCond(expr, env);
            case "case"     : return this.evalCase(expr, env);
            case "begin"    : return this.evalExprLst(expr.slice(1), env);
            case "for"      : return this.evalFor(expr, env);
            case "while"    : return this.evalWhile(expr, env);
        }

        const res: [boolean, any] = this.resolveThroughLib(expr, env);
        if (res[0]) return res[1];

        return this.applyProcedure(expr, env);
    }

    private lookup(symbol: string, env: any[]): any {
        for (const cell of env) {
            if (symbol === cell[0]) {
                return cell[1];
            }
        }

        return null;
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

    private applyProcedure(expr: any[], env: any[]): any {
        const closure = this.evalExpr(expr[0], env);
        const args    = (expr.length > 1) ? this.mapExprLst(expr.slice(1), env) : [];

        if (this.isDebug) {
            console.log("applProc proc:", JSON.stringify(closure));
            console.log("applProc args:", JSON.stringify(args));
        }

        // [closure, [par1, par2, ...], expr, env]
        const closureBody: any  = closure[2].length === 1 ? closure[2][0] : closure[2];
        const closureEnv: any[] = this.assocList(closure[1], args).concat(env).concat(closure[3]);

        return this.evalExpr(closureBody, closureEnv);
    }

    private assocList(lst1: any[], lst2: any[]): any[] {
        const aList: any[] = [];
        for (let i = 0; i < lst1.length; i++) {
            aList.push([lst1[i], lst2[i]]);
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

        const body : any = expr.length === 4 ? expr[3] : ["begin", ... expr.slice(3)];
        const value: any = this.evalLambda(["lambda", expr[2], body], env);

        env.unshift([expr[1], value]);

        return symbol;
    }

    // [if, test-expr, then-expr, else-expr]
    private evalIf(expr: any[], env: any[]): any {
        const value = this.isTruthy(this.evalExpr(expr[1], env))
                            ? this.evalExpr(expr[2], env)
                            : this.evalExpr(expr[3], env);
        return value;
    }

    private isTruthy(expr: any): boolean {
        return !this.isFaulty(expr);
    }

    private isFaulty(expr: any): boolean {
        if (Array.isArray(expr) && expr.length === 0) return true;
        return !expr;
    }

    // {cond [test-expr then-body ...] ... [else then-body ...]}
    private evalCond(expr: any, env: any[]): any {
        return this.evalCondLoop(expr.slice(1), env);
    }

    private evalCondLoop(condClauses: any, env: any): any {
        const clause = condClauses[0];

        if (clause[0] === "else"){
            return this.evalExprLst(clause.slice(1), env);
        }

        if (this.evalExpr(clause[0], env)) {
            return this.evalExprLst(clause.slice(1), env);
        }

        return this.evalCondLoop(condClauses.slice(1), env);
    }

    // {case expr
    //       ([a1, a2, ...] expr)
    //       ([b1, b2, ...] expr}
    //       (else          expr) }
    private evalCase(expr: any, env: any[]): any {
        const val: any = this.evalExpr(expr[1], env);
        return this.evalCaseLoop(val, expr.slice(2), env);
    }

    private evalCaseLoop(val: any, condClauses: any[], env: any): any {
        const clause = condClauses[0];

        if (clause[0] === "else"){
            return this.evalExprLst(clause.slice(1), env);
        }

        if (clause[0].indexOf(val) > -1) {
            return this.evalExprLst(clause.slice(1), env);
        }

        return this.evalCaseLoop(val, condClauses.slice(1), env);
    }

    // {for (i 0) (< i 10) (add1 i) exp1 exp2 ...}
    private evalFor(expr: any, env: any[]): any {
        const counterPair = [expr[1][0], expr[1][1]];
        const getNewEnv = (e: any[], c: any[]) => {
            e.unshift(c); return e;
        };

        let lastRes: any;

        for (; this.evalExpr(expr[2].slice(), getNewEnv(env, counterPair));
               counterPair[1] = this.evalExpr(expr[3].slice(), getNewEnv(env, counterPair))) {
            lastRes = this.evalExprLst(expr.slice(4), getNewEnv(env, counterPair));
        }

        return lastRes;
    }

    // {while, condition, expr1, expr2, ...}
    private evalWhile(expr: any, env: any[]): any {
        let lastRes: any = null;

        while (this.evalExpr(expr[1],env)) {
            lastRes = this.evalExprLst(expr.slice(2), env);
        }

        return lastRes;
    }

    private resolveThroughLib(expr: any[], env: any[]): [boolean, any] {
        for (const lib of this.libs) {
            const res = lib.libEvalExpr(expr, env);
            if (res !== "##not-resolved##") return [true, res];
        }
        return [false, null];
    }
}