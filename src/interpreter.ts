"use strict";

class Interpreter {
    private readonly libs: ILib[];
    private isDebug: boolean;
    private print: Function;

    constructor() {
        this.print = console.log;
        this.isDebug = false;

        this.libs = [];
        this.libs.push(new SchemeLib(this));
        this.libs.push(new ListLib(this));
        this.libs.push(new StringLib(this));
        this.libs.push(new MathLib(this));
        this.libs.push(new NumberLib(this));
    }

    public evalCodeTree(codeTree: any[], options: Options): any {
        this.print   = options.print;
        this.isDebug = options.isDebug;

        return this.evalExprLst(codeTree, []);
    }

    private evalExprLst(exprLst: any[], env: any): any[] {
        let res: any;
        for (const expr of exprLst) {
            res = this.evalExpr(expr, env);
        }
        return res;
    }

    private mapExprLst(exprLst: any[], env: any): any[] {
        return exprLst.map((expr: any) => this.evalExpr(expr, env), exprLst);
    }

    private lookup(symbol: string, env: any[]): any {
        for (const cell of env) {
            if (this.isDebug) console.log("lookup symbol:", JSON.stringify(symbol), "cell:", JSON.stringify(cell));

            if (symbol === cell[0]) {
                const val = cell[1];
                if (this.isDebug) console.log("lookup found :", JSON.stringify(symbol), "value:", JSON.stringify(val));
                return val;
            }
        }

        throw Error(`lookup unbound symbol: ${JSON.stringify(symbol)}`);
    }

    public evalExpr(expr: any, env: any[]): any {
        if (this.isDebug) console.log("evalExpr expr:", JSON.stringify(expr), "env:", JSON.stringify(env));

        // Constants
        if (expr === "null")  return null;
        if (expr === "true")  return true;
        if (expr === "false") return false;

        // Primitives
        if (typeof expr === "number") return expr;
        if (typeof expr === "string") return this.lookup(expr, env);

        switch (expr[0]) {
            // easl syntax
            case "list"     : return this.mapExprLst(expr.slice(1), env);
            case "string"   : return expr[1];

            case "let"      : return this.evalLet(expr, env);
            case "lambda"   : return this.evalLambda(expr, env);
            case "function" : return this.evalFunction(expr, env);

            case "if"       : return this.evalIf(expr, env);
            case "cond"     : return this.evalCond(expr, env);
            case "begin"    : return this.evalExprLst(expr.slice(1), env);
            case "for"      : return this.evalFor(expr, env);

            // core lib
            case "+"   : return this.evalExpr(expr[1], env) + this.evalExpr(expr[2], env);
            case "-"   : return this.evalExpr(expr[1], env) - this.evalExpr(expr[2], env);
            case "*"   : return this.evalExpr(expr[1], env) * this.evalExpr(expr[2], env);
            case "/"   : return this.evalExpr(expr[1], env) / this.evalExpr(expr[2], env);

            case "="   : return this.evalExpr(expr[1], env) === this.evalExpr(expr[2], env);
            case ">"   : return this.evalExpr(expr[1], env) >   this.evalExpr(expr[2], env);
            case "<"   : return this.evalExpr(expr[1], env) <   this.evalExpr(expr[2], env);
            case "!="  : return this.evalExpr(expr[1], env) !== this.evalExpr(expr[2], env);
            case ">="  : return this.evalExpr(expr[1], env) >=  this.evalExpr(expr[2], env);
            case "<="  : return this.evalExpr(expr[1], env) <=  this.evalExpr(expr[2], env);

            case "and" : return this.evalExpr(expr[1], env) && this.evalExpr(expr[2], env);
            case "or"  : return this.evalExpr(expr[1], env) || this.evalExpr(expr[2], env);
            case "not" : return this.evalNot(this.evalExpr(expr[1], env));

            case "type-of"    : return this.evalTypeOf(expr[1], env);
            case "to-string"  : return String(this.evalExpr(expr[1], env));
            case "to-number"  : return this.toNumber(this.evalExpr(expr[1], env));
            case "to-boolean" : return this.toBoolean(this.evalExpr(expr[1], env));

            case "print" : return this.print(String(this.mapExprLst(expr.slice(1), env).join(" "))) || "";
        }

        const res = this.resolveThroughLib(expr, env);
        if (res !== "##not-resolved##") return res;

        if (Array.isArray(expr)){
            const proc = this.evalExpr(expr[0], env);
            const args = (expr.length > 1) ? this.mapExprLst(expr.slice(1), env) : [];

            return this.applyProcedure(proc, args, env);
        } else {
            throw Error(`evalExpr - not proc reached the end: ${expr}`);
        }
    }

    private applyProcedure(proc: any, procArgs: any[], env: any[]): any {
        if (this.isDebug) {
            console.log("applProc proc:", JSON.stringify(proc));
            console.log("applProc args:", JSON.stringify(procArgs));
        }

        if (Array.isArray(proc) && proc[0] === "closure") {
            // [closure, [par1, par2, ...], expr, env]

            const closureEnv = this.assocList(proc[1], procArgs).concat(env).concat(proc[3]);
            const closureBody = proc[2];

            return this.evalExpr(closureBody, closureEnv);
        }

        return proc;
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

    // [let, symbol, expr]
    // [let, symbol, [lambda, [par1, par2, ...], expr]]
    private evalLet(expr: any, env: any[]): any {
        const symbol: string = expr[1];
        const body  : any    = expr[2];
        const value : any    = (Array.isArray(body) && body[0] === "lambda")
                                        ? this.evalLambda(["lambda", body[1], body[2]], env)
                                        : this.evalExpr(body, env);

        env.unshift([symbol, value]);

        return value;
    }

    // [function, symbol, expr]
    // [function, symbol, [par1, par2, ...], expr]
    // [function, symbol, [par1, par2, ...], expr1, expr2, ...]
    private evalFunction(expr: any[], env: any[]): any {
        const length: number = expr.length;
        const symbol: string = expr[1];
        const params: any[]  = length > 3 ? expr[2] : [];
        const body  : any    = length > 4 ? ["begin", ... expr.slice(3)] :  expr[length - 1];
        const value : any    = this.evalLambda(["lambda", params, body], env);

        env.unshift([symbol, value]);

        return value;
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

    private evalTypeOf (expr: any, env: any[]): string {
        if (Array.isArray(expr)) {
            switch (expr[0]) {
                case "list"     : return "list";
                case "string"   : return "string";
                case "lambda"   :
                case "function" :
                case "closure"  : return "function";
            }
        }

        if (expr === "null") return "null";

        const value =  this.evalExpr(expr, env);

        if (Array.isArray(value)) {
            switch (value[0]) {
                case "lambda"   :
                case "function" :
                case "closure"  : return "function";
            }
        }

        return typeof value;
    }

    private evalNot(a: any): boolean {
        return (Array.isArray(a) && a.length === 0) || !a;
    }

    private toBoolean(a: any): boolean {
        return !this.evalNot(a);
    }

    private toNumber(a: any): number | null {
        const number = Number(a);
        return Number.isNaN(number) ? null : number;
    };

    private resolveThroughLib(expr: any[], env: any[]): any {
        for (const lib of this.libs) {
            const res = lib.eval(expr, env);
            if (res !== "##not-resolved##") return res;
        }
        return "##not-resolved##";
    }
}
