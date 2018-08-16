"use strict";

class Interpreter {
    private isDebug: boolean;
    private print: Function;

    constructor() {
        this.print = console.log;
        this.isDebug = false;
    }

    public evalCodeTree(codeTree: any[], options: EvalOptions): any {
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
        if (this.isNumber(expr))    return expr;
        if (this.isUndefined(expr)) return expr;

        // Lookup
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
            case "begin"    : return this.evalExprLst(this.cdr(expr), env);
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
            case "not" : return this.not(this.evalExpr(expr[1], env));

            case "print"     : return this.print(String(this.mapExprLst(expr.slice(1), env).join(" "))) || "";
            case "type-of"   : return this.evalTypeOf(expr[1], env);
            case "to-string" : return String(this.evalExpr(expr[1], env));


            // scheme lib
            case "eq?"      : return this.evalExpr(expr[1], env) === this.evalExpr(expr[2], env);
            case "boolean?" : return this.isBoolean(this.evalExpr(expr[1], env));
            case "null?"    : return this.isNull   (this.evalExpr(expr[1], env));
            case "number?"  : return this.isNumber (this.evalExpr(expr[1], env));
            case "string?"  : return this.isString (this.evalExpr(expr[1], env));
            case "pair?"    : return this.isPair   (this.evalExpr(expr[1], env));
            case "list?"    : return this.isList   (this.evalExpr(expr[1], env));
            case "cons"     : return this.evalCons(expr.slice(1), env);
            case "car"      : return this.car(this.evalExpr(expr[1], env));
            case "cdr"      : return this.cdr(this.evalExpr(expr[1], env));
            case "caar"     : return this.caar(this.evalExpr(expr[1], env));
            case "cadr"     : return this.cadr(this.evalExpr(expr[1], env));
            case "cdar"     : return this.cdar(this.evalExpr(expr[1], env));
            case "cddr"     : return this.cddr(this.evalExpr(expr[1], env));


            // list lib
            case "list.empty"  : return [];
            case "list.empty?" : return this.listEmpty(expr, env);
            case "list.length" : return this.listLength(expr, env);
            case "list.first"  : return this.listFirst(expr, env);
            case "list.rest"   : return this.listRest(expr, env);
            case "list.last"   : return this.listLast(expr, env);
            case "list.least"  : return this.listLeast(expr, env);
            case "list.add"    : return this.listAdd(expr, env);
            case "list.push"   : return this.listPush(expr, env);
            case "list.index"  : return this.listIndex(expr, env);
            case "list.has?"   : return this.listHas(expr, env);
            case "list.get"    : return this.listGet(expr, env);
            case "list.set"    : return this.listSet(expr, env);
            case "list.swap"   : return this.listSwap(expr, env);
            case "list.append" : return this.listAppend(expr, env);
            case "list.slice"  : return this.listSlice(expr, env);
            case "list.flatten": return this.listFlatten(expr, env);
            case "list.join"   : return this.listJoin(expr, env);


            // string lib
            case "str.length" : return this.strLength(expr, env);
            case "str.has"    : return this.strHas(expr, env);
            case "str.split"  : return this.strSplit(expr, env);
            case "str.concat" : return this.strConcat(expr, env);

        }

        if (Array.isArray(expr)){
            const proc = this.evalExpr(expr[0], env);
            const args = (expr.length > 1) ? this.mapExprLst(expr.slice(1), env) : [];

            return this.applyProcedure(proc, args, env);
       }   else {
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

    private evalLambda(expr: any, env: any[]): any[] {
        // [lambda, [par1, par2, ...], expr]

        return ["closure", expr[1], expr[2], env.slice()];
    }

    private evalLet(expr: any, env: any[]): any {
        // [let, symbol, expr]
        // [let, symbol, [lambda, [par1, par2, ...], expr]]

        const symbol: string = expr[1];
        const body  : any    = expr[2];
        const value : any    = (Array.isArray(body) && body[0] === "lambda")
                                        ? this.evalLambda(["lambda", body[1], body[2]], env)
                                        : this.evalExpr(body, env);
        env.unshift([symbol, value]);

        return value;
    }

    private evalFunction(expr: any[], env: any[]): any {
        // [function, symbol, expr]
        // [function, symbol, [par1, par2, ...], expr]
        // [function, symbol, [par1, par2, ...], expr1, expr2, ...]

        const length: number = expr.length;
        const symbol: string = expr[1];
        const params: any[]  = length > 3 ? expr[2] : [];
        const body  : any    = length > 4 ? ["begin", ... expr.slice(3)] :  expr[length - 1];
        const value : any    = this.evalLambda(["lambda", params, body], env);
        env.unshift([symbol, value]);

        return value;
    }

    private evalIf(expr: any[], env: any[]): any {
        // [if, test-expr, then-expr, else-expr]

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

    private evalCons(argsLst: any[], env: any[]): any[] {
        const a = this.evalExpr(argsLst[0], env);
        const b = this.evalExpr(argsLst.slice(1), env);
        return this.cons(a, b);
    }

    private evalCond(expr: any, env: any[]): any {
        // {cond [test-expr then-body ...] ... [else then-body ...]}

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

    private evalFor(expr: any, env: any[]): any {
        // {for (i 0) (< i 10) (add1 i) exp1 exp2 ...}

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

    private isNull      = (a: any) => a === null;
    private isNumber    = (a: any) => typeof a === "number";
    private isString    = (a: any) => typeof a === "string";
    private isBoolean   = (a: any) => typeof a === "boolean";
    private isUndefined = (a: any) => typeof a === "undefined";

    private not = (a: any) => this.isEmptyList(a) || !a;

    private isList = (a: any) => Array.isArray(a);
    private isEmptyList = (a: any) => Array.isArray(a) && a.length === 0;
    private isPair = (lst: any[]) => Array.isArray(lst) && lst.length > 0;

    private car  = (lst: any[]) => lst[0];
    private cdr  = (lst: any[]) => lst.slice(1);
    private caar = (lst: any[]) => this.car(this.car(lst));
    private cadr = (lst: any[]) => this.car(this.cdr(lst));
    private cdar = (lst: any[]) => this.cdr(this.car(lst));
    private cddr = (lst: any[]) => this.cdr(this.cdr(lst));

    private cons = (a: any, b: any) => {
        if (b === null) return [a];
        if ( this.isList(b)) return  b.unshift(a) && b;
        return [a, b];
    };

    private listEmpty(expr: any[], env: any[]): boolean {
        const lst = this.evalExpr(expr[1], env);
        return Array.isArray(lst) ? lst.length === 0 : true
    }

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
