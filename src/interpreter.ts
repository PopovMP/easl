"use strict";

class Interpreter {
    private isDebug = false;

    public evalCodeTree(codeTree: any[]): any {
        return this.evalExprLst(codeTree, ["empty-env"]);
    }

    private evalExprLst(exprLst: any[], env: any): any[] {
        const newEnv = this.assocDefines(exprLst, env);
        const res = this.mapExprLst(exprLst, newEnv);
        return res[res.length - 1];
    }

    private mapExprLst(exprLst: any[], env: any): any[] {
        return exprLst.map((expr: any) => this.evalExpr(expr, env), exprLst);
    }

    private assocDefines(exprLst: any[], env: any[]): any[] {
        const newEnv: any[] = env.slice();
        for (const expr of exprLst) {
            if (Array.isArray(expr) && expr[0] === "define") {
                newEnv.unshift(this.manageDefine(expr, newEnv));
            }
        }
        return newEnv;
    }

    private manageDefine(expr: any, env: any[]): any[] {
        if (typeof (expr[1]) === "string") {
            // expr = [define, var-id, expr]
            return [expr[1], this.evalExpr(expr[2], env)];
        }

        // expr = [define, [proc-id, par1, par2, ...], expr1, expr2, ...]
        if (Array.isArray([expr[1]])) {
            const procId     = expr[1][0];
            const procParams = expr[1].slice(1);
            const procBody   = expr.slice(2);
            return [procId, ["closure", procParams, procBody, env.slice()]];
        }

        return env; // No define
    }

    private lookup(symbol: string, env: any[]): any {
        if (this.isDebug) console.log("lookup symbol:", JSON.stringify(symbol), "env:", JSON.stringify(env));

        if (this.not(this.isPair(env))) {
            new Error(`lookup unbound symbol: ${JSON.stringify(symbol)}`);
            return [];
        }

        if (env[0] === "letrec-env") {
            // ["letrec-env", [letrec-proc ...] env]
            const proc = this.getPair(symbol, env[1]);
            // proc = [proc-id, "letrec-proc", [par1, par2 ...], [expr1, expr2 ...]]
            if (proc[0] === symbol) {
                const closure =  ["closure", proc[2], proc[3], env];
                if (this.isDebug) console.log("lookup closure found:", JSON.stringify(symbol), "value:", JSON.stringify(closure));
                return closure;
            } else {
                return this.lookup(symbol, env[2]);
            }
        }

        if (env[0] === "let-proc") {
            // env = ["let-proc", proc-id, [par1, par2 ...], [expr1, expr2 ...], env]
            if (env[1] === symbol) {
                const closure =  ["closure", env[2], env[3], env];
                if (this.isDebug) console.log("lookup closure found:", JSON.stringify(symbol), "value:", JSON.stringify(closure));
                return closure;
            } else {
                return this.lookup(symbol, env[4]);
            }
        }

        if (symbol === env[0][0]) {
            const val = env[0][1];
            if (this.isDebug) console.log("lookup symbol found:", JSON.stringify(symbol), "value:", JSON.stringify(val));
            return val;
        }

        return this.lookup(symbol, env.slice(1));
    }

    public evalExpr(expr: any, env: any[]): any {
        if (this.isDebug) console.log("evalExpr expr:", JSON.stringify(expr), "env:", JSON.stringify(env));

        // Constants
        if (expr === "null")  return null;
        if (expr === "true")  return true;
        if (expr === "false") return false;

        // Primitives
        if (this.isNumber(expr))    return expr;
        if (this.isNull(expr))      return expr;
        if (this.isBoolean(expr))   return expr;
        if (this.isUndefined(expr)) return expr;

        // Lookup
        if (typeof expr === "string") {
            const val = this.lookup(expr, env);
            if (typeof val === "undefined") {
                new Error(`lookup returns 'undefined' for symbol: ${JSON.stringify(expr)}`);
            }
            return val;
        }


        switch (expr[0]) {

            // Equality
            case "eq?"    : return this.evalExpr(expr[1], env) === this.evalExpr(expr[2], env);

            // Predicates
            case "boolean?" : return this.isBoolean(this.evalExpr(expr[1], env));
            case "null?"    : return this.isNull   (this.evalExpr(expr[1], env));
            case "number?"  : return this.isNumber (this.evalExpr(expr[1], env));
            case "string?"  : return this.isString (this.evalExpr(expr[1], env));
            case "pair?"    : return this.isPair   (this.evalExpr(expr[1], env));
            case "list?"    : return this.isList   (this.evalExpr(expr[1], env));

            // Math
            case "zero?" : return this.evalExpr(expr[1], env) === 0;
            case "add1"  : return this.evalExpr(expr[1], env) + 1;
            case "sub1"  : return this.evalExpr(expr[1], env) - 1;

            case "+" : return this.evalExpr(expr[1], env) + this.evalExpr(expr[2], env);
            case "-" : return this.evalExpr(expr[1], env) - this.evalExpr(expr[2], env);
            case "*" : return this.evalExpr(expr[1], env) * this.evalExpr(expr[2], env);
            case "/" : return this.evalExpr(expr[1], env) / this.evalExpr(expr[2], env);

            case "="  : return this.evalExpr(expr[1], env) === this.evalExpr(expr[2], env);
            case ">"  : return this.evalExpr(expr[1], env) >   this.evalExpr(expr[2], env);
            case "<"  : return this.evalExpr(expr[1], env) <   this.evalExpr(expr[2], env);
            case "!=" : return this.evalExpr(expr[1], env) !== this.evalExpr(expr[2], env);
            case ">=" : return this.evalExpr(expr[1], env) >=  this.evalExpr(expr[2], env);
            case "<=" : return this.evalExpr(expr[1], env) <=  this.evalExpr(expr[2], env);

            // logic
            case "and" : return this.evalExpr(expr[1], env) && this.evalExpr(expr[2], env);
            case "or"  : return this.evalExpr(expr[1], env) || this.evalExpr(expr[2], env);
            case "not" : return this.not(this.evalExpr(expr[1], env));

            // (list expr1 expr2 ...) → list
            case "list" : return this.mapExprLst(expr.slice(1), env);

            // (string "content") → "content"
            case "string" : return expr[1];

            // (length lst) → int
            case "length" : return this.length(expr[1]);

            // ((cons expr1 expr2) → pair
            case "cons" : return this.evalCons(expr.slice(1), env);

            // c*r
            case "car"   : return this.car(this.evalExpr(expr[1], env));
            case "cdr"   : return this.cdr(this.evalExpr(expr[1], env));
            case "caar"  : return this.caar(this.evalExpr(expr[1], env));
            case "cadr"  : return this.cadr(this.evalExpr(expr[1], env));
            case "cdar"  : return this.cdar(this.evalExpr(expr[1], env));
            case "cddr"  : return this.cddr(this.evalExpr(expr[1], env));
            case "caaar" : return this.caaar(this.evalExpr(expr[1], env));
            case "caadr" : return this.caadr(this.evalExpr(expr[1], env));
            case "cadar" : return this.cadar(this.evalExpr(expr[1], env));
            case "caddr" : return this.caddr(this.evalExpr(expr[1], env));
            case "cddar" : return this.cddar(this.evalExpr(expr[1], env));
            case "cdddr" : return this.cdddr(this.evalExpr(expr[1], env));

            // list
            case "list.empty"  : return [];
            case "list.length" : return this.listLength(expr, env);
            case "list.first"  : return this.listFirst(expr, env);
            case "list.rest"   : return this.listRest(expr, env);
            case "list.last"   : return this.listLast(expr, env);
            case "list.least"  : return this.listLeast(expr, env);
            case "list.add"    : return this.listAdd(expr, env);
            case "list.push"   : return this.listPush(expr, env);
            case "list.index"  : return this.listIndex(expr, env);
            case "list.has"    : return this.listHas(expr, env);
            case "list.get"    : return this.listGet(expr, env);
            case "list.set"    : return this.listSet(expr, env);
            case "list.swap"   : return this.listSwap(expr, env);
            case "list.append" : return this.listAppend(expr, env);
            case "list.slice"  : return this.listSlice(expr, env);
            case "list.flatten": return this.listFlatten(expr, env);
            case "list.join"   : return this.listJoin(expr, env);

            // string
            case "str.length" : return this.strLength(expr, env);
            case "str.has"    : return this.strHas(expr, env);
            case "str.split"  : return this.strSplit(expr, env);
            case "str.concat" : return this.strConcat(expr, env);

            // (print expr)
            case "print" : return console.log(this.evalExpr(expr[1], env).toString());


            // {if (test-expr) (then-expr) (else-expr)}
            case "if" : return this.isTruthy(this.evalExpr(expr[1], env))
                ? this.evalExpr(expr[2], env)
                : this.evalExpr(expr[3], env);

            case "define" : return;

            // {cond [test-expr then-body ...] ... [else then-body ...]}
            case "cond" : return this.evalCond(expr, env);

            // {begin exp1 exp2 ...}
            case "begin" : return this.evalExprLst(this.cdr(expr), env);

            // {for (i 0) (< i 10) (add1 i) exp1 exp2 ...}
            case "for" : return this.evalFor(expr, env);

            // {lambda [par1 par2 ...] expr}
            case "lambda" : return ["closure", expr[1], expr[2], env.slice()];

            case "let"    : return this.evalLet(expr, env);
            case "let*"   : return this.evalLetStar(expr, env);
            case "letrec" : return this.evalLetRec(expr, env);
        }

        return this.applyProcedure(this.evalExpr(expr[0], env), this.mapExprLst(expr.slice(1), env));
    }

    private applyProcedure(proc: any, argsList: any[]): any {
        if (this.isDebug) {
            console.log("applProc proc:", JSON.stringify(proc));
            console.log("applProc args:", JSON.stringify(argsList));
        }

        if (this.isPair(proc) && proc[0] === "closure") {
            // proc = ["closure", [par1, par2 ...], [expr1, expr2 ...], env]
            const paramsList = proc[1];
            const exprList   = proc[2];
            const closureEnv = proc[3];

            const exprEnv    = this.assocList(paramsList, argsList).concat(closureEnv);
            return this.evalExpr(exprList, exprEnv);
        }

        return proc;
    }

    private isTruthy(expr: any): boolean {
        return !this.isFaulty(expr);
    }

    private isFaulty(expr: any): boolean {
        if (Array.isArray(expr) && expr.length === 0) return true;
        return !expr;
    }

    private getPair(symb: string, alist: any[]): any[] {
        for (let i = 0; i < alist.length; i++) {
            if (alist[i][0] === symb) return alist[i];
        }
        console.error("#getPair: \"Pair doesn't found!\"  symbol:",
            JSON.stringify(symb), "alist:", JSON.stringify(alist));
        return [];
    }

    private assocList(lst1: any[], lst2: any[]): any[] {
        const aList: any[] = [];
        for (let i = 0; i < lst1.length; i++) {
            aList.push([lst1[i], lst2[i]]);
        }
        return aList;
    }

    private evalCons(argsLst: any[], env: any[]): any[] {
        const a = this.evalExpr(argsLst[0], env);
        const b = this.evalExpr(argsLst.slice(1), env);
        return this.cons(a, b);
    }

    private evalCond(expr: any, env: any[]): any {
        return this.evalCondLoop(expr.slice(1), env);
    }

    private evalCondLoop(condClauses: any, env: any): any {
        const clause = condClauses[0];
        if (clause[0] === "else"){
            return this.evalExprLst(clause.slice(1), env);
        } else {
            if (this.evalExpr(clause[0], env)) {
                return this.evalExprLst(clause.slice(1), env);
            } else {
                return this.evalCondLoop(condClauses.slice(1), env);
            }
        }
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

    private evalLet(expr: any, env: any[]): any {
        if (typeof expr[1] === "string") {
            // expr = ["let", "proc-id", [["s1", v1], ["s2", v2], ...], expr1, expr2, ...]
            return this.evalLetProc(expr, env);
        } else {
            // expr = ["let", [["s1", v1], ["s2", v2], ...], expr1, expr2, ...]
            return this.evalExprLst(expr.slice(2), this.assocLetArgs(expr[1], env));
        }
    }

    private evalLetStar(expr: any, env: any[]): any {
        // expr = ["let*", [["s1", v1], ["s2", v2], ...], expr1, expr2, ...]
        return this.evalExprLst(expr.slice(2), this.assocLetStarArgs(expr[1], env));
    }

    private evalLetProc(expr: any, env: any[]): any {
        // expr = ["let", "proc-id", [["s1", v1], ["s2", v2], ...], expr1, expr2, ...]
        const procId     = expr[1];
        const procParams = expr[2].map((pair: any[]) => pair[0]);
        const bodyExpr   = expr.slice(3);
        const assocEnv   = this.assocLetArgs(expr[2], env);

        return this.evalExpr(bodyExpr, ["let-proc", procId, procParams, bodyExpr, assocEnv]);
    }

    private assocLetArgs(argsList: any[], env: any[]): any[] {
        return this.assocLetArgsLoop(argsList, env, env);
    }

    private assocLetArgsLoop(argsList: any[], env: any[], letEnv: any[]): any[] {
        if (argsList.length === 0) {
            return letEnv.slice();
        } else {
            return this.assocLetArgsLoop(argsList.slice(1), env,
                            this.evalLetArgPair(argsList[0], env).concat(letEnv));
        }
    }

    private assocLetStarArgs(argsList: any[], env: any[]): any[] {
        return this.assocLetStarArgsLoop(argsList, env);
    }

    private assocLetStarArgsLoop(argsList: any[], letEnv: any[]): any[] {
        if (argsList.length === 0) {
            return letEnv.slice();
        } else {
            return this.assocLetStarArgsLoop(argsList.slice(1), this.evalLetArgPair(argsList[0],
                            letEnv).concat(letEnv));
        }
    }

    private evalLetArgPair(argPair: any[], env: any[]): any[] {
        const key = argPair[0];
        const val = this.evalExpr(argPair[1], env);
        return [[key, val]];
    }

    private evalLetRec(expr: any, env: any[]): any {
        //  (letrec ([proc-id (lambda (par1 par2 ...) expr1 expr2 ...)]
        //           [proc-id (lambda (par1 par2 ...) expr1 expr2 ...)]) expr1 expr2 ...)
        const procBinds = expr[1].map((e: any) => [e[0], "letrec-proc", e[1][1], e[1].slice(2)], expr[1]);
        return this.evalExpr(expr.slice(2), ["letrec-env", procBinds, env.slice()]);
    }

    private isNull      = (a: any) => a === null || a === "null" || a === "" || this.isEmptyList(a);
    private isNumber    = (a: any) => typeof a === "number";
    private isString    = (a: any) => typeof a === "string";
    private isBoolean   = (a: any) => typeof a === "boolean";
    private isUndefined = (a: any) => typeof a === "undefined";

    private not = (a: any) => this.isEmptyList(a) || !a;

    private isList = (a: any) => Array.isArray(a);
    private isEmptyList = (a: any) => Array.isArray(a) && a.length === 0;

    private car = (lst: any[]) => lst[0];
    private cdr = (lst: any[]) => lst.slice(1);

    private caar = (lst: any[]) => this.car(this.car(lst));
    private cadr = (lst: any[]) => this.car(this.cdr(lst));
    private cdar = (lst: any[]) => this.cdr(this.car(lst));
    private cddr = (lst: any[]) => this.cdr(this.cdr(lst));

    private caaar = (lst: any[]) => this.car(this.car(this.car(lst)));
    private caadr = (lst: any[]) => this.car(this.car(this.cdr(lst)));
    private cadar = (lst: any[]) => this.car(this.cdr(this.car(lst)));
    private caddr = (lst: any[]) => this.car(this.cdr(this.cdr(lst)));
    private cddar = (lst: any[]) => this.cdr(this.cdr(this.car(lst)));
    private cdddr = (lst: any[]) => this.cdr(this.cdr(this.cdr(lst)));

    private cons = (a: any, b: any) => {
        if (b === null) return [a];
        if ( this.isList(b)) return  b.unshift(a) && b;
        return [a, b];
    };

    private length = (lst: any[]) => lst.length;
    private isPair = (lst: any[]) => Array.isArray(lst) && lst.length > 0;

    private listLength(expr: any[], env: any[]): number {
        const lst = this.evalExpr(expr[1], env);
        return Array.isArray(lst) ? lst.length : -1;
    }

    private listFirst(expr: any[], env: any[]): any {
        const lst = this.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 0 ? lst[0] : null;
    }

    private listLast(expr: any[], env: any[]): any {
        const lst = this.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 0 ? lst[lst.length - 1] : null;
    }

    private listRest(expr: any[], env: any[]): any[] {
        const lst = this.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 1 ? lst.slice(1) :  [];
    }

    private listLeast(expr: any[], env: any[]): any[] {
        const lst = this.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 1 ? lst.slice(0, lst.length - 1) : [];
    }

    private listAdd(expr: any[], env: any[]): any[] {
        const elm: any = this.evalExpr(expr[1], env);
        const lst: any[] = this.evalExpr(expr[2], env);
        if(Array.isArray(lst)) {
            lst.push(elm);
            return lst;
        }
        if (lst === null) {
            return [elm];
        }
        return [lst, elm];
    }

    private listPush(expr: any[], env: any[]): any[] {
        const elm: any = this.evalExpr(expr[1], env);
        const lst: any[] = this.evalExpr(expr[2], env);
        if(Array.isArray(lst)) {
            lst.unshift(elm);
            return lst;
        }
        if (lst === null) {
            return [elm];
        }
        return [elm, lst];
    }

    private listIndex(expr: any[], env: any[]): number {
        const elm: any = this.evalExpr(expr[1], env);
        const lst: any[] = this.evalExpr(expr[2], env);
        if(Array.isArray(lst)) {
            return lst.indexOf(elm);
        }
        return -1;
    }

    private listHas(expr: any[], env: any[]): boolean {
        return this.listIndex(expr, env) > -1;
    }

    private listGet(expr: any[], env: any): any {
        const index: any = this.evalExpr(expr[1], env);
        const lst: any[] = this.evalExpr(expr[2], env);

        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            return lst[index];
        }

        return null;
    }

    private listSet(expr: any[], env: any): any[] {
        const elm: any = this.evalExpr(expr[1], env);
        const index: any = this.evalExpr(expr[2], env);
        const lst: any[] = this.evalExpr(expr[3], env);

        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            const newLst = lst.slice();
            newLst[index] = elm;
            return newLst;
        }

        return lst;
    }

    private listSwap(expr: any[], env: any): any[] {
        const i1: any = this.evalExpr(expr[1], env);
        const i2: any = this.evalExpr(expr[2], env);
        const lst: any[] = this.evalExpr(expr[3], env);

        if (Array.isArray(lst) && i1 >= 0 && i1 < lst.length &&  i2 >= 0 && i2 < lst.length) {
            const newLst = lst.slice();
            newLst[i1] = lst[i2];
            newLst[i2] = lst[i1];
            return newLst;
        }

        return [];
    }

    private listAppend(expr: any[], env: any): any[] {
        const lst1: any[] = this.evalExpr(expr[1], env);
        const lst2: any[] = this.evalExpr(expr[2], env);

        return Array.isArray(lst2) ? lst2.concat(lst1) : lst1;
    }

    private listSlice(expr: any[], env: any): any[] {
        const from: any = this.evalExpr(expr[1], env);
        const to: any = this.evalExpr(expr[2], env);
        const lst: any[] = this.evalExpr(expr[3], env);

        return lst.slice(from, to);
    }

    private listFlatten(expr: any[], env: any): any[] {
        const lst: any[] = this.evalExpr(expr[1], env);
        return this.flattenArray(lst);
    }

    private listJoin(expr: any[], env: any): string {
        const sep: any = expr[1];
        const lst: any[] = this.evalExpr(expr[2], env);
        return lst.join(sep);
    }

    private strLength(expr: any[], env: any): number {
        const str = this.evalExpr(expr[1], env);
        return typeof str === "string" ? str.length : -1;
    }

    private strHas(expr: any[], env: any): boolean {
        const elem = this.evalExpr(expr[1], env);
        const str = this.evalExpr(expr[2], env);
        return str.includes(elem);
    }

    private strSplit(expr: any[], env: any): string {
        const sep = this.evalExpr(expr[1], env);
        const str = this.evalExpr(expr[2], env);
        return str.split(sep);
    }

    private strConcat(expr: any[], env: any): string {
        const str1 = this.evalExpr(expr[1], env);
        const str2 = this.evalExpr(expr[2], env);
        return str1 + str2;
    }

    private flattenArray(arr: any[]): any[] {
        return arr.reduce((flat, toFlatten) =>
            flat.concat(Array.isArray(toFlatten)
                ? this.flattenArray(toFlatten)
                : toFlatten), []);
    }
}
