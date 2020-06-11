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
        "list.make"    : this.listMake,
        "list.pop"     : this.listPop,
        "list.push"    : this.listPush,
        "list.range"   : this.listRange,
        "list.rest"    : this.listRest,
        "list.reverse" : this.listReverse,
        "list.set"     : this.listSet,
        "list.shift"   : this.listShift,
        "list.slice"   : this.listSlice,
        "list.sort"    : this.listSort,
        "list.splice"  : this.listSplice,
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

    // (list.concat lst1 lst2)
    private listConcat(expr: any[], env: any): any[] {
        const [lst1, lst2] = <[any[], any[]]>this.inter.evalArgs(["array", "array"], expr, env);

        return lst1.concat(lst2);
    }

    // (list.first lst)
    private listFirst(expr: any[], env: any[]): any {
        const [lst] = <[any[]]>this.inter.evalArgs(["array"], expr, env);
        Validator.assertArrayIndex("list.first", lst, 0);

        return lst[0];
    }

    // (list.flatten lst)
    private listFlatten(expr: any[], env: any): any[] {
        const [lst] = <[any[]]>this.inter.evalArgs(["array"], expr, env);

        const flatten = (arr: any[]): any[] =>
                arr.reduce( (acc: any[], elem: any) =>
                                acc.concat( Array.isArray(elem)
                                                ? flatten(elem)
                                                : elem ),
                             []);

        return flatten(lst);
    }

    // (list.get lst index)
    private listGet(expr: any[], env: any): any {
        const [lst, index] = <[any[], number]>this.inter.evalArgs(["array", "number"], expr, env);
        Validator.assertArrayIndex("list.get", lst, index);

        return lst[index];
    }

    // (list.has lst elem)
    private listHas(expr: any[], env: any[]): boolean {
        const [lst, elem] = <[any[], any]>this.inter.evalArgs(["array", "scalar"], expr, env);

        return lst.includes(elem);
    }

    // (list.index-of lst elem)
    private listIndex(expr: any[], env: any[]): number {
        const [lst, elem] = <[any[], any]>this.inter.evalArgs(["array", "scalar"], expr, env);

        return lst.indexOf(elem);
    }

    // (list.join lst sep=",")
    private listJoin(expr: any[], env: any): string {
        const [lst, sep] = <[any[], string]>this.inter.evalArgs(["array", ["string", ","]], expr, env);

        return lst.join(sep);
    }

    // (list.last lst)
    private listLast(expr: any[], env: any[]): any {
        const [lst] = <[any[]]>this.inter.evalArgs(["array"], expr, env);

        return lst.length > 0 ? lst[lst.length - 1] : null;
    }

    // (list.less lst)
    private listLess(expr: any[], env: any[]): any[] {
        const [lst] = <[any[]]>this.inter.evalArgs(["array"], expr, env);

        return lst.length > 1 ? lst.slice(0, lst.length - 1) : [];
    }

    // (list.pop lst)
    private listPop(expr: any[], env: any[]): any[] {
        const [lst] = <[any[]]>this.inter.evalArgs(["array"], expr, env);

        return lst.pop();
    }

    // (list.length lst)
    private listLength(expr: any[], env: any[]): number {
        const [lst] = <[any[]]>this.inter.evalArgs(["array"], expr, env);

        return lst.length;
    }

    // (list.make size fill=0)
    private listMake(expr: any[], env: any[]): any[] {
        const [size, fill] = <[number, any]>this.inter.evalArgs(["number", ["any", 0]], expr, env);

        return [ ...Array(size).keys() ].map( () => fill );
    }

    // (list.push lst elem)
    private listPush(expr: any[], env: any[]): any[] {
        const [lst, elem] = <[any[], any]>this.inter.evalArgs(["array", "any"], expr, env);

        lst.push(elem);

        return lst;
    }

    // (list.range size from=0)
    private listRange(expr: any[], env: any[]): any[] {
        const [size, from] = <[number, number]>this.inter.evalArgs(["number", ["number", 0]], expr, env);

        return [ ...Array(size).keys() ].map( (e: number) => e + from );
    }

    // (list.rest lst)
    private listRest(expr: any[], env: any[]): any[] {
        const [lst] = <[any[]]>this.inter.evalArgs(["array"], expr, env);

        return Array.isArray(lst) && lst.length > 1 ? lst.slice(1) : [];
    }

    // (list.reverse lst)
    private listReverse(expr: any[], env: any): any[] {
        const [lst] = <[any[]]>this.inter.evalArgs(["array"], expr, env);

        return lst.reverse();
    }

    // (list.set lst index elem)
    private listSet(expr: any[], env: any): any[] {
        const [lst, index, elem] = <[any[], number, any]>this.inter.evalArgs(["array", "number", "any"], expr, env);
        Validator.assertArrayIndex("list.set", lst, index);

        lst[index] = elem;

        return lst;
    }

    // (list.shift lst)
    private listShift(expr: any[], env: any[]): any[] {
        const [lst] = <[any[]]>this.inter.evalArgs(["array"], expr, env);

        return lst.shift();
    }

    // (list.slice lst start=0 end=length)
    private listSlice(expr: any[], env: any[]): any[] {
        const [lst, start, end] = <[any[], number, number]>this.inter.evalArgs(["array", ["number", 0], ["number", 0]], expr, env);
        Validator.assertArrayIndex("list.slice", lst, start);

        return lst.slice(start, end || lst.length);
    }

    // (list.sort lst)
    private listSort(expr: any[], env: any[]): any[] {
        const [lst] = <[any[]]>this.inter.evalArgs(["array"], expr, env);

        return lst.sort();
    }

    // (list.splice lst start count=1)
    private listSplice(expr: any[], env: any[]): any[] {
        const [lst, start, count] = <[any[], number, number]>this.inter.evalArgs(["array", "number", ["number", 1]], expr, env);
        Validator.assertArrayIndex("list.splice", lst, start);

        lst.splice(start, count);

        return lst;
    }

    // (list.unshift lst elem)
    private listUnshift(expr: any[], env: any[]): any[] {
        const [lst, elem] = <[any[], any]>this.inter.evalArgs(["array", "any"], expr, env);

        lst.unshift(elem);

        return lst;
    }
}
