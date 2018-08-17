"use strict";

class ListLib implements ILib {
    private readonly inter: Interpreter;

    constructor(interpreter: Interpreter) {
        this.inter = interpreter;
    }

    public libEvalExpr(expr: any[], env: any[]): any {
        switch (expr[0]) {
            case "list.add"      : return this.listAdd(expr, env);
            case "list.add!"     : return this.listAdd(expr, env, false);
            case "list.append"   : return this.listAppend(expr, env);
            case "list.empty"    : return [];
            case "list.empty?"   : return this.listEmpty(expr, env);
            case "list.first"    : return this.listFirst(expr, env);
            case "list.flatten"  : return this.listFlatten(expr, env);
            case "list.get"      : return this.listGet(expr, env);
            case "list.has?"     : return this.listHas(expr, env);
            case "list.index"    : return this.listIndex(expr, env);
            case "list.is-list?" : return this.listIsList(expr, env);
            case "list.join"     : return this.listJoin(expr, env);
            case "list.last"     : return this.listLast(expr, env);
            case "list.least"    : return this.listLeast(expr, env);
            case "list.length"   : return this.listLength(expr, env);
            case "list.push"     : return this.listPush(expr, env);
            case "list.push!"    : return this.listPush(expr, env, false);
            case "list.rest"     : return this.listRest(expr, env);
            case "list.set"      : return this.listSet(expr, env);
            case "list.set!"     : return this.listSet(expr, env, false);
            case "list.slice"    : return this.listSlice(expr, env);
        }

        return "##not-resolved##";
    }

    private listAdd(expr: any[], env: any[], pure: boolean = true): any[] {
        const elm: any   = this.inter.evalExpr(expr[1], env);
        const lst: any[] = this.inter.evalExpr(expr[2], env);

        if (Array.isArray(lst)) {
            const list = pure ? lst.slice() : lst;
            list.push(elm);
            return list;
        }

        if (lst === null) {
            return [elm];
        }

        return [lst, elm];
    }

    private listAppend(expr: any[], env: any): any[] {
        const lst1: any[] = this.inter.evalExpr(expr[1], env);
        const lst2: any[] = this.inter.evalExpr(expr[2], env);

        return Array.isArray(lst2) ? lst2.concat(lst1) : lst1;
    }

    private listEmpty(expr: any[], env: any[]): boolean {
        const lst = this.inter.evalExpr(expr[1], env);

        return Array.isArray(lst) ? lst.length === 0 : true
    }

    private listFirst(expr: any[], env: any[]): any {
        const lst = this.inter.evalExpr(expr[1], env);

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
        const index: any = this.inter.evalExpr(expr[1], env);
        const lst: any[] = this.inter.evalExpr(expr[2], env);

        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            return lst[index];
        }

        return null;
    }

    private listHas(expr: any[], env: any[]): boolean {
        return this.listIndex(expr, env) > -1;
    }

    private listIndex(expr: any[], env: any[]): number {
        const elm: any   = this.inter.evalExpr(expr[1], env);
        const lst: any[] = this.inter.evalExpr(expr[2], env);

        if (Array.isArray(lst)) {
            return lst.indexOf(elm);
        }

        return -1;
    }

    private listIsList(expr: any[], env: any[]): boolean {
        const lst: any[] = this.inter.evalExpr(expr[1], env);

        return Array.isArray(lst);
    }

    private listJoin(expr: any[], env: any): string {
        const sep: any   = expr[1];
        const lst: any[] = this.inter.evalExpr(expr[2], env);

        return lst.join(sep);
    }

    private listLast(expr: any[], env: any[]): any {
        const lst = this.inter.evalExpr(expr[1], env);

        return Array.isArray(lst) && lst.length > 0 ? lst[lst.length - 1] : null;
    }

    private listLeast(expr: any[], env: any[]): any[] {
        const lst = this.inter.evalExpr(expr[1], env);

        return Array.isArray(lst) && lst.length > 1 ? lst.slice(0, lst.length - 1) : [];
    }

    private listLength(expr: any[], env: any[]): number {
        const lst = this.inter.evalExpr(expr[1], env);

        return Array.isArray(lst) ? lst.length : -1;
    }

    private listPush(expr: any[], env: any[], pure: boolean = true): any[] {
        const elm: any   = this.inter.evalExpr(expr[1], env);
        const lst: any[] = this.inter.evalExpr(expr[2], env);

        if (Array.isArray(lst)) {
            const list = pure ? lst.slice() : lst;
            list.unshift(elm);
            return list;
        }

        if (lst === null) {
            return [elm];
        }

        return [elm, lst];
    }

    private listRest(expr: any[], env: any[]): any[] {
        const lst = this.inter.evalExpr(expr[1], env);

        return Array.isArray(lst) && lst.length > 1 ? lst.slice(1) : [];
    }

    private listSet(expr: any[], env: any, pure: boolean = true): any[] {
        const elm: any   = this.inter.evalExpr(expr[1], env);
        const index: any = this.inter.evalExpr(expr[2], env);
        const lst: any[] = this.inter.evalExpr(expr[3], env);

        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            const list = pure ? lst.slice() : lst;
            list[index] = elm;
            return list;
        }

        return lst;
    }

    private listSlice(expr: any[], env: any): any[] {
        const from: any  = this.inter.evalExpr(expr[1], env);
        const to: any    = this.inter.evalExpr(expr[2], env);
        const lst: any[] = this.inter.evalExpr(expr[3], env);

        return lst.slice(from, to);
    }
}
