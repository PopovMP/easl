"use strict";

class ListLib implements ILib {
    private readonly inter: Interpreter;
    private readonly methods: any = {
        "list.concat"  : this.listConcat,
        "list.first"   : this.listFirst,
        "list.flatten" : this.listFlatten,
        "list.get"     : this.listGet,
        "list.has"     : this.listHas,
        "list.index-of": this.listIndex,
        "list.join"    : this.listJoin,
        "list.last"    : this.listLast,
        "list.length"  : this.listLength,
        "list.less"    : this.listLess,
        "list.pop"     : this.listPop,
        "list.push"    : this.listPush,
        "list.range"   : this.listRange,
        "list.rest"    : this.listRest,
        "list.reverse" : this.listReverse,
        "list.set"     : this.listSet,
        "list.shift"   : this.listShift,
        "list.slice"   : this.listSlice,
        "list.sort"    : this.listSort,
        "list.unshift" : this.listUnshift,
    };

    public readonly builtinFunc: string[];
    public readonly builtinHash: any = {};

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;
        this.builtinFunc = Object.keys(this.methods);

        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        return this.methods[expr[0]].call(this, expr, env);
    }

    // [list.concat lst1 lst2]
    private listConcat(expr: any[], env: any): any[] {
        const [lst1, lst2] = this.inter.evalArgs(["array", "array"], expr, env);

        return (lst1 as any[]).concat(lst2 as any[]);
    }

    // [list.first lst]
    private listFirst(expr: any[], env: any[]): any {
        const [lst] = this.inter.evalArgs(["array"], expr, env);
        Validator.assertArrayIndex("list.first", lst, 0);

        return (lst as any[])[0];
    }

    // [list.flatten lst]
    private listFlatten(expr: any[], env: any): any[] {
        const [lst] = this.inter.evalArgs(["array"], expr, env);

        return this.listFlattenLoop(lst);
    }

    private listFlattenLoop(arr: any[]): any[] {
        return arr.reduce((flat, toFlatten) =>
            flat.concat(Array.isArray(toFlatten)
                ? this.listFlattenLoop(toFlatten)
                : toFlatten), []);
    }

    // [list.get lst index]
    private listGet(expr: any[], env: any): any {
        const [lst, index] = this.inter.evalArgs(["array", "number"], expr, env);
        Validator.assertArrayIndex("list.get", lst, index);

        return lst[index];
    }

    // [list.has lst elem]
    private listHas(expr: any[], env: any[]): boolean {
        const [lst, elem] = this.inter.evalArgs(["array", "scalar"], expr, env);

        return (lst as any[]).includes(elem);
    }

    // [list.index-of lst elem]
    private listIndex(expr: any[], env: any[]): number {
        const [lst, elem] = this.inter.evalArgs(["array", "scalar"], expr, env);

        return (lst as any[]).indexOf(elem);
    }

    // [list.join lst sep=","]
    private listJoin(expr: any[], env: any): string {
        const [lst, sep] = this.inter.evalArgs(["array", ["string", ","]], expr, env);

        return lst.join(sep);
    }

    // [list.last lst]
    private listLast(expr: any[], env: any[]): any {
        const [lst] = this.inter.evalArgs(["array"], expr, env);

        return (lst as any[]).length > 0
            ? (lst as any[])[(lst as any[]).length - 1]
            : null;
    }

    // [list.less lst]
    private listLess(expr: any[], env: any[]): any[] {
        const [lst] = this.inter.evalArgs(["array"], expr, env);

        return (lst as any[]).length > 1
            ? (lst as any[]).slice(0, (lst as any[]).length - 1)
            : [];
    }

    // [list.pop lst]
    private listPop(expr: any[], env: any[]): any[] {
        const [lst] = this.inter.evalArgs(["array"], expr, env);

        return (lst as any[]).pop();
    }

    // [list.length lst]
    private listLength(expr: any[], env: any[]): number {
        const [lst] = this.inter.evalArgs(["array"], expr, env);

        return (lst as any[]).length;
    }

    // [list.push lst elem]
    private listPush(expr: any[], env: any[]): any[] {
        const [lst, elem] = this.inter.evalArgs(["array", "any"], expr, env);

        (lst as any[]).push(elem);

        return lst;
    }

    // [list.range size from=0]
    private listRange(expr: any[], env: any[]): any[] {
        const [size, from] = this.inter.evalArgs(["number", ["number", 0]], expr, env);

        return [...Array(size).keys()].map(e => e + from);
    }

    // [list.rest lst]
    private listRest(expr: any[], env: any[]): any[] {
        const lst: any[] = this.inter.evalExpr(expr[1], env);

        return Array.isArray(lst) && lst.length > 1 ? lst.slice(1) : [];
    }

    // [list.reverse lst]
    private listReverse(expr: any[], env: any): any[] {
        const [lst] = this.inter.evalArgs(["array"], expr, env);

        return lst.reverse();
    }

    // [list.set lst index elem]
    private listSet(expr: any[], env: any): any[] {
        const [lst, index, elem] = this.inter.evalArgs(["array", "number", "any"], expr, env);
        Validator.assertArrayIndex("list.set", lst, index);

        lst[index] = elem;

        return lst;
    }

    // [list.shift lst]
    private listShift(expr: any[], env: any[]): any[] {
        const [lst] = this.inter.evalArgs(["array"], expr, env);

        return (lst as any[]).shift();
    }

    // [list.slice lst begin end]
    private listSlice(expr: any[], env: any[]): any[] {
        const [lst, begin, end] = this.inter.evalArgs(["array", ["number", 0], ["number", Number.MAX_SAFE_INTEGER]],
            expr, env);

        return (lst as any[]).slice(begin, end);
    }

    // [list.sort lst]
    private listSort(expr: any[], env: any[]): any[] {
        const [lst] = this.inter.evalArgs(["array"], expr, env);

        return lst.sort();
    }

    // [list.unshift lst obj]
    private listUnshift(expr: any[], env: any[]): any[] {
        const [lst, elem] = this.inter.evalArgs(["array", "any"], expr, env);

        (lst as any[]).unshift(elem);

        return lst;
    }
}
