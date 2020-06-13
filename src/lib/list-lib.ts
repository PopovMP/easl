"use strict";

class ListLib implements ILib {
    private readonly inter: Interpreter;
    private readonly methods: any = {
        "list"         : this.list,
        "list-make"    : this.listMake,
        "list-range"   : this.listRange,

        "list-concat"  : this.listConcat,
        "list-flat"    : this.listFlat,
        "list-get"     : this.listGet,
        "list-has"     : this.listHas,
        "list-index-of": this.listIndex,
        "list-join"    : this.listJoin,
        "list-length"  : this.listLength,
        "list-pop"     : this.listPop,
        "list-push"    : this.listPush,
        "list-reverse" : this.listReverse,
        "list-set"     : this.listSet,
        "list-shift"   : this.listShift,
        "list-slice"   : this.listSlice,
        "list-sort"    : this.listSort,
        "list-splice"  : this.listSplice,
        "list-unshift" : this.listUnshift,
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

    // (list expr*)
    private list(expr: any[], env: any[]): any[] {
        return this.inter.mapExprList(expr.slice(1), env);
    }

    // (list.make size fill=0)
    private listMake(expr: any[], env: any[]): any[] {
        const [size, fill] = <[number, any]>this.inter.evalArgs(["number", ["any", 0]], expr, env);

        return [ ...Array(size).keys() ].map( () => fill );
    }

    // (list.range size from=0)
    private listRange(expr: any[], env: any[]): any[] {
        const [size, from] = <[number, number]>this.inter.evalArgs(["number", ["number", 0]], expr, env);

        return [ ...Array(size).keys() ].map( (e: number) => e + from );
    }

    // (list.concat lst1 lst2)
    private listConcat(expr: any[], env: any): any[] {
        const [lst1, lst2] = <[any[], any[]]>this.inter.evalArgs(["array", "array"], expr, env);

        return lst1.concat(lst2);
    }

    // (list.flat lst depth=1)
    // Returns a new array with all sub-array elements concatenated into it recursively up to the specified depth.
    private listFlat(expr: any[], env: any[]): any {
        const [lst, depth] = <[any[], number]>this.inter.evalArgs(["array", ["number", 1]], expr, env);

        return lst.flat(depth);
    }

    // (list.get lst index)
    private listGet(expr: any[], env: any): any {
        const [lst, index] = <[any[], number]>this.inter.evalArgs(["array", "number"], expr, env);
        Validator.assertArrayIndex("list-get", lst, index);

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

    // (list.push lst elem)
    //  Appends new elements to an array, and returns the new length of the array.
    private listPush(expr: any[], env: any[]): number {
        const [lst, elem] = <[any[], any]>this.inter.evalArgs(["array", "any"], expr, env);

        return lst.push(elem);
    }

    // (list.reverse lst)
    private listReverse(expr: any[], env: any): any[] {
        const [lst] = <[any[]]>this.inter.evalArgs(["array"], expr, env);

        return lst.reverse();
    }

    // (list.set lst index elem)
    private listSet(expr: any[], env: any): any[] {
        const [lst, index, elem] = <[any[], number, any]>this.inter.evalArgs(["array", "number", "any"], expr, env);
        Validator.assertArrayIndex("list-set", lst, index);

        return lst[index] = elem;
    }

    // (list.shift lst)
    // Removes the first element from an array and returns that removed element ot undefined.
    private listShift(expr: any[], env: any[]): any[] {
        const [lst] = <[any[]]>this.inter.evalArgs(["array"], expr, env);

        return lst.shift();
    }

    // (list.slice lst start=0 end=length)
    private listSlice(expr: any[], env: any[]): any[] {
        const [lst, start, end] = <[any[], number, number]>this.inter.evalArgs(["array", ["number", 0], ["number", 0]], expr, env);

        return lst.slice(start, end || lst.length);
    }

    // (list.sort lst)
    private listSort(expr: any[], env: any[]): any[] {
        const [lst] = <[any[]]>this.inter.evalArgs(["array"], expr, env);

        return lst.sort();
    }

    // (list.splice lst start count=1)
    // Deletes elements from a list. Returns a list of the deleted elements.
    private listSplice(expr: any[], env: any[]): any[] {
        const [lst, start, count] = <[any[], number, number]>this.inter.evalArgs(["array", "number", ["number", 1]], expr, env);
        Validator.assertArrayIndex("list-splice", lst, start);

        return lst.splice(start, count);
    }

    // (list.unshift lst elem)
    // Add an element to the beginning of an array and return the new length of the array.
    private listUnshift(expr: any[], env: any[]): number {
        const [lst, elem] = <[any[], any]>this.inter.evalArgs(["array", "any"], expr, env);

        return lst.unshift(elem);
    }
}
