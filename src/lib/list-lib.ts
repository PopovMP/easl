"use strict";

class ListLib implements ILib {
    private readonly inter: Interpreter;
    public readonly builtinFunc = ["list.add", "list.concat", "list.first", "list.flatten", "list.get",
        "list.has", "list.index", "list.join", "list.last", "list.least", "list.length", "list.push",
        "list.range", "list.reverse", "list.rest", "list.set", "list.slice", "list.sort"];
    public readonly builtinHash: any = {};

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;

        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "list.add"     : return this.listAdd(expr, env);
            case "list.concat"  : return this.listConcat(expr, env);
            case "list.first"   : return this.listFirst(expr, env);
            case "list.flatten" : return this.listFlatten(expr, env);
            case "list.get"     : return this.listGet(expr, env);
            case "list.has"     : return this.listHas(expr, env);
            case "list.index"   : return this.listIndex(expr, env);
            case "list.join"    : return this.listJoin(expr, env);
            case "list.last"    : return this.listLast(expr, env);
            case "list.least"   : return this.listLeast(expr, env);
            case "list.length"  : return this.listLength(expr, env);
            case "list.push"    : return this.listPush(expr, env);
            case "list.range"   : return this.listRange(expr, env);
            case "list.reverse" : return this.listReverse(expr, env);
            case "list.rest"    : return this.listRest(expr, env);
            case "list.set"     : return this.listSet(expr, env);
            case "list.slice"   : return this.listSlice(expr, env);
            case "list.sort"    : return this.listSort(expr, env);
        }

        throw "Error: Not found in 'list-lib': " + expr[0];
    }

    private listAdd(expr: any[], env: any[]): any[] {
        const lst: any[] = this.inter.evalExpr(expr[1], env);
        const elm: any   = this.inter.evalExpr(expr[2], env);

        if (Array.isArray(lst)) {
            lst.push(elm);
            return lst;
        }

        if (lst === null) {
            return [elm];
        }

        return [lst, elm];
    }

    private listConcat(expr: any[], env: any): any[] {
        const lst1: any[] = this.inter.evalExpr(expr[1], env);
        const lst2: any[] = this.inter.evalExpr(expr[2], env);

        return Array.isArray(lst1) ? lst1.concat(lst2) : lst1;
    }

    private listFirst(expr: any[], env: any[]): any {
        const lst: any[] = this.inter.evalExpr(expr[1], env);

        return Array.isArray(lst) && lst.length > 0 ? lst[0] : null;
    }

    private listFlatten(expr: any[], env: any): any[] {
        const lst: any[] = this.inter.evalExpr(expr[1], env);

        return this.listFlattenLoop(lst);
    }

    private listFlattenLoop(arr: any[]): any[] {
        return arr.reduce((flat, toFlatten) =>
            flat.concat(Array.isArray(toFlatten)
                ? this.listFlattenLoop(toFlatten)
                : toFlatten), []);
    }

    private listGet(expr: any[], env: any): any {
        const lst: any[] = this.inter.evalExpr(expr[1], env);
        const index: any = this.inter.evalExpr(expr[2], env);

        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            return lst[index];
        }

        return null;
    }

    private listHas(expr: any[], env: any[]): boolean {
        return this.listIndex(expr, env) > -1;
    }

    private listIndex(expr: any[], env: any[]): number {
        const lst: any[] = this.inter.evalExpr(expr[1], env);
        const elm: any   = this.inter.evalExpr(expr[2], env);

        if (Array.isArray(lst)) {
            return lst.indexOf(elm);
        }

        return -1;
    }

    private listJoin(expr: any[], env: any): string {
        const lst: any[]  = this.inter.evalExpr(expr[1], env);
        const sep: string = expr.length === 3 ? this.inter.evalExpr(expr[2], env) : ",";

        return lst.join(sep);
    }

    private listLast(expr: any[], env: any[]): any {
        const lst: any[] = this.inter.evalExpr(expr[1], env);

        return Array.isArray(lst) && lst.length > 0 ? lst[lst.length - 1] : null;
    }

    private listLeast(expr: any[], env: any[]): any[] {
        const lst: any[] = this.inter.evalExpr(expr[1], env);

        return Array.isArray(lst) && lst.length > 1 ? lst.slice(0, lst.length - 1) : [];
    }

    private listLength(expr: any[], env: any[]): number {
        const lst: any[] = this.inter.evalExpr(expr[1], env);

        return Array.isArray(lst) ? lst.length : -1;
    }

    private listPush(expr: any[], env: any[]): any[] {
        const lst: any[] = this.inter.evalExpr(expr[1], env);
        const elm: any   = this.inter.evalExpr(expr[2], env);

        if (Array.isArray(lst)) {
            lst.unshift(elm);
            return lst;
        }

        if (lst === null) {
            return [elm];
        }

        return [elm, lst];
    }

    // (list.range start end step)
    private listRange(expr: any[], env: any[]): any[] {
        const start: number = this.inter.evalExpr(expr[1], env);
        const end:   number = this.inter.evalExpr(expr[2], env);
        if (typeof start !== "number") throw "Error: The 'start' parameter must be a number in 'list.range'.";
        if (typeof end   !== "number") throw "Error: The 'end' parameter must be a number in 'list.range'.";
        if (start === end)  return [start];

        const step:  number = expr.length === 4
            ? this.inter.evalExpr(expr[3], env)
            : end > start ? 1 : -1;

        if (typeof step !== "number") throw "Error: The 'step' parameter must be a number in 'list.range'.";
        if (step === 0)               throw "Error: The 'step' parameter cannot be 0 in 'list.range'.";
        if (step > 0 && end < start)  throw "Error: The 'step' parameter cannot be lower than 0 in a rising list in 'list.range'.";
        if (step < 0 && end > start)  throw "Error: The 'step' parameter cannot be higher than 0 in a lowering list 'list.range'.";

        const res: number[] = [];
        if (end > start) {
            for (let i: number = start; i <= end; i += step) {
                res.push(i);
            }
        } else {
            for (let i: number = start; i >= end; i += step) {
                res.push(i);
            }
        }

        return res;
    }

    private listRest(expr: any[], env: any[]): any[] {
        const lst: any[] = this.inter.evalExpr(expr[1], env);

        return Array.isArray(lst) && lst.length > 1 ? lst.slice(1) : [];
    }

    private listReverse(expr: any[], env: any): any[] {
        const lst: any[]  = this.inter.evalExpr(expr[1], env);

        return lst.reverse();
    }

    private listSet(expr: any[], env: any): any[] {
        const lst: any[]    = this.inter.evalExpr(expr[1], env);
        const index: number = this.inter.evalExpr(expr[2], env);
        const elm: any      = this.inter.evalExpr(expr[3], env);

        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            lst[index] = elm;
            return lst;
        }

        return lst;
    }

    private listSlice(expr: any[], env: any[]): any[] {
        const lst: any[]    = this.inter.evalExpr(expr[1], env);
        const args: number  = expr.length - 2;
        const begin: number = args > 0 ? this.inter.evalExpr(expr[2], env) : 0;
        const end: number   = args > 1 ? this.inter.evalExpr(expr[3], env) : lst.length;

        return lst.slice(begin, end);
    }

    private listSort(expr: any[], env: any[]): any[] {
        const lst: any[]  = this.inter.evalExpr(expr[1], env);

        return lst.sort();
    }
}
