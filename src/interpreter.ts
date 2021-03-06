"use strict";

class Interpreter {
    private isDebug: boolean;
    private readonly libs: ILib[];
    private readonly builtinHash: any = {};
    private readonly specialForms: any = {
        "and"        : this.evalAnd,
        "apply"      : this.evalApply,
        "block"      : this.evalBlock,
        "break"      : this.evalBreak,
        "case"       : this.evalCase,
        "cond"       : this.evalCond,
        "const"      : this.evalConst,
        "continue"   : this.evalContinue,
        "collect"    : this.evalCollect,
        "debug"      : this.evalDebug,
        "dec"        : this.evalDecrement,
        "defined"    : this.evalDefined,
        "delete"     : this.evalDelete,
        "display"    : this.evalDisplay,
        "do"         : this.evalDo,
        "enum"       : this.evalEnum,
        "eval"       : this.evalEval,
        "for"        : this.evalFor,
        "if"         : this.evalIf,
        "inc"        : this.evalIncrement,
        "lambda"     : this.evalLambda,
        "let"        : this.evalLet,
        "newline"    : this.evalNewline,
        "or"         : this.evalOr,
        "parse"      : this.evalParse,
        "print"      : this.evalPrint,
        "quasiquote" : this.evalQuasiquote,
        "quote"      : this.evalQuote,
        "repeat"     : this.evalRepeat,
        "set"        : this.evalSet,
        "string"     : this.evalString,
        "throw"      : this.evalThrow,
        "try"        : this.evalTry,
        "type-of"    : this.evalTypeOf,
        "unless"     : this.evalUnless,
        "value-of"   : this.evalValueOf,
        "when"       : this.evalWhen,
        "while"      : this.evalWhile,
        "yield"      : this.evalYield,
    };

    public options: Options;

    constructor() {
        this.isDebug = false;
        this.libs    = [];
        this.options = new Options();

        for (const form of Object.keys(this.specialForms) ) {
            this.builtinHash[form] = true;
        }
    }

    public evalCodeTree(codeTree: any[], options: Options, callback?: Function): any {
        this.options = options;
        this.libs.push(... LibManager.getBuiltinLibs(options.libs, this) );

        if (typeof callback === "function") {
            LibManager.manageImports(codeTree,
                this.manageImport_ready.bind(this, callback));
        } else {
            return this.evalExprList(codeTree, []);
        }
    }

    public evalExprList(exprLst: any[], env: any[]): any {
        let res: any;

        for (const expr of exprLst) {
            res = this.evalExpr(expr, env);
        }

        return res;
    }

    public mapExprList(exprLst: any[], env: any[]): any[] {
        const res: any[] = [];

        for (const expr of exprLst) {
            res.push( this.evalExpr(expr, env) );
        }

        return res;
    }

    public evalExpr(expr: any | any[], env: any[]): any {
        // Constants
        switch (expr) {
            case "null"  : return null;
            case "true"  : return true;
            case "false" : return false;
        }

        // Types
        switch (typeof expr) {
            case "number" : return expr;
            case "string" : return this.lookup(expr, env);
        }

        if (this.isDebug) {
            this.isDebug = false;
            this.dumpExpression(expr);
        }

        const form: string | any[] = expr[0];

        if (form === undefined) {
            throw "Error: Improper function application. Probably: ()";
        }

        // Special form or a builtin proc
        if (typeof form === "string") {
            if (this.builtinHash[form]) {
                return this.specialForms[form].call(this, expr, env);
            }

            for (const lib of this.libs) {
                if (lib.builtinHash[form]) {
                    return lib.libEvalExpr(expr, env);
                }
            }
        }

        // User proc
        return this.evalApplication(expr, env);
    }

    public evalArgs(argTypes: (string | [string, any])[], expr: any[], env: any[]): any[] {
        const optionalCount: number = argTypes.filter(Array.isArray).length;
        this.assertArity(expr, argTypes.length, optionalCount);

        return argTypes.map( (argType: string | [string, any], index: number) => {
            const isRequired = !Array.isArray(argType);
            const arg: any = isRequired || index + 1 < expr.length
                ? this.evalExpr(expr[index + 1], env)
                : argTypes[index][1];

            this.assertArgType(expr[0], arg, (isRequired ? argType : argType[0]) as string);

            return arg;
        });
    }

    public assertType(arg: any, argType: string): boolean {
        switch (argType) {
            case "any":
                return true;
            case "array":
                return Array.isArray(arg);
            case "scalar":
                return arg === null ||
                    ["string", "number", "boolean"].includes(typeof arg);
            default:
                return typeof arg === argType;
        }
    }

    private addToEnv(symbol: string, value: any, modifier: string, env: any[]): void {
        if (typeof value === "undefined") {
            throw `Error: cannot set unspecified value to symbol: ${symbol}.`;
        }

        for (let i = env.length - 1; i > -1; i--) {
            const cellKey = env[i][0];

            if (cellKey === "#scope") {
                break;
            }

            if (cellKey === symbol) {
                throw `Error: Identifier already defined: ${symbol}`;
            }
        }

        env.push([symbol, value, modifier]);
    }

    private setInEnv(symbol: string, value: any, env: any[]): void {
        if (typeof value === "undefined") {
            throw `Error: cannot set unspecified value to a symbol. Given: ${symbol}.`;
        }

        for (let i = env.length - 1; i > -1; i--) {
            if (symbol === env[i][0]) {
                if (env[i][2] === "const") {
                    throw `Error: cannot modify a constant symbol. Given: ${symbol}.`;
                }
                else if (env[i][2] === "arg") {
                    throw `Error: cannot modify a function argument. Given: ${symbol}.`;
                }

                env[i][1] = value;
                return;
            }
        }

        throw `Error: Unbound identifier: ${symbol}`;
    }

    private lookup(symbol: string, env: any[]): any {
        for (let i = env.length - 1; i > -1; i--) {
            if (symbol === env[i][0]) {
                return env[i][1];
            }
        }

        for (const lib of this.libs) {
            if (lib.builtinHash[symbol]) {
                return symbol;
            }
        }

        throw `Error: Unbound identifier: ${symbol}`;
    }

    private isDefined(symbol: string, env: any[]): any {
        for (let i = env.length - 1; i > -1; i--) {
            if (symbol === env[i][0]) {
                return true;
            }
        }

        for (const lib of this.libs) {
            if (lib.builtinHash[symbol]) {
                return true;
            }
        }

        return false;
    }

    private clearEnv(tag: string, env: any[]): void {
        let cell: [string, any];
        do {
            cell = env.pop();
        } while (cell[0] !== tag);
    }

    // (proc-id arg*)
    // ((lambda (par*) expr+) arg*)
    private evalApplication(expr: any[], env: any[]): any {
        const proc: string | any[] = expr[0];
        const isNamed: boolean = typeof proc === "string";
        const procId:  string  = isNamed ? proc as string : proc[0];
        const closure: any[] | string = isNamed
            ? this.lookup(proc as string, env)
            : this.evalExpr(proc, env);

        if ( typeof closure === "string" && this.isDefined(closure, env) ) {
            return this.evalExpr([this.evalExpr(closure, env), ...expr.slice(1)], env);
        }

        if ( !Array.isArray(closure) || closure[0] !== "closure") {
            throw `Error: Improper function application. Given: ${Printer.stringify(closure)}`;
        }

        const args: any[] = expr.length === 1
            ? []
            : expr.length === 2
                ? [this.evalExpr(expr[1], env)]
                : this.mapExprList(expr.slice(1), env);

        const params:     any[]  = closure[1];
        const body:       any[]  = closure[2];
        const closureEnv: any[]  = closure[3].concat([["#scope", procId], ["#args", args], ["#name", procId]]);
        const scopeStart: number = closureEnv.length - 1;

        this.evalListDestructuring(params, args, "arg", closureEnv);

        const res: any = this.evalExprList(body, closureEnv);

        if ( Array.isArray(res) && res[0] === "closure" ) {
            // Doesn't clean the scope to preserve the closure.
            // Remove only the initial scope tag
            closureEnv.splice(scopeStart, 1);
        } else {
            this.clearEnv("#scope", closureEnv);
        }

        return res;
    }

    // (string text)
    private evalString(expr: string[]): string {
        if (expr.length !== 2) {
            throw "Error: 'string' requires 1 argument. Given: " + (expr.length - 1);
        }

        return expr[1];
    }

    // (let (symbol symbol*) (expr expr*)) ; list destructuring
    // (let symbol expr)                   ; variable definition
    // (let symbol (par*)                  ; procedure definition
    //     expr+)
    private evalLet(expr: any[], env: any[]): void {
        this.evalLetConst(expr, env, "let");
    }

    // (const (symbol symbol*) (expr expr*)) ; list destructuring
    // (const symbol expr)                   ; variable definition
    // (const symbol (par*)                  ; procedure definition
    //     expr+)
    private evalConst(expr: any[], env: any[]): void {
        this.evalLetConst(expr, env, "const");
    }

    private evalLetConst(expr: any[], env: any[], modifier: string): void {
        if (expr.length === 3 && Array.isArray(expr[1])) {
            this.evalListDestructuring(expr[1], this.evalExpr(expr[2], env), modifier, env);
            return;
        }

        if ( !Array.isArray(expr[2]) && expr.length !== 3 ) {
            throw "Error: '" + modifier + "' requires a symbol and a value.";
        }

        const param: any = expr.length === 3
            ? expr[2]
            : ["lambda", expr[2], ...expr.slice(3)];

        const value: any = this.evalExpr(param, env);

        this.addToEnv(expr[1], value, modifier, env);
    }

    private evalListDestructuring(params: any[], args: any[], modifier: string, env: any[]): void {
        if ( !Array.isArray(args) ) {
            throw "Error: list destructuring requires one iterable argument.";
        }

        const restIndex: number = params.indexOf(".");

        for (let i: number = 0; i < params.length && i !== restIndex; i++) {
            const isParamArray: boolean = Array.isArray(params[i]);
            const param :string = isParamArray ? params[i][0] : params[i];
            const value: any    = typeof args[i] === "undefined"
                ? isParamArray
                    ? this.evalExpr(params[i][1], env)
                    : `Error: cannot set unspecified value to parameter: ${param}.`
                : args[i];

            this.addToEnv(param, value, modifier, env);
        }

        if (restIndex > -1) {
            const param :string = params[restIndex + 1];
            const value: any    = args.length < restIndex
                ? []
                : args.slice(restIndex);

            this.addToEnv(param, value, modifier, env);
        }
    }

    // (set symbol expr)
    private evalSet(expr: any[], env: any[]): void {
        if (expr.length !== 3) {
            throw "Error: 'set' requires 2 arguments. Given: " + (expr.length - 1);
        }

        this.setInEnv(expr[1], this.evalExpr(expr[2], env), env);
    }

    // (delete symbol)
    private evalDelete(expr: any[], env: any[]): void {
        if (expr.length !== 2) {
            throw "Error: 'delete' requires 1 argument. Given: " + (expr.length - 1);
        }

        const symbol: string = expr[1];

        for (let i = env.length - 1; i > -1; i--) {
            const cellKey = env[i][0];

            if (cellKey === "#scope") {
                throw `Error: 'delete' unbound identifier: ${symbol}`;
            }

            if (cellKey === symbol) {
                env.splice(i, 1);
                return;
            }
        }

        throw `Error: 'delete' unbound identifier: ${symbol}`;
    }

    // (inc symbol delta)
    private evalIncrement(expr: any[], env: any[]): any {
        if (expr.length === 1 || expr.length > 3) {
            throw "Error: 'inc' requires 1 or 2 arguments. Given: " + (expr.length - 1);
        }

        if (typeof expr[1] !== "string") {
            throw "Error: 'inc' requires a symbol. Given: " + expr[1];
        }

        const delta: number | any = expr.length === 2
            ? 1
            : this.evalExpr(expr[2], env);

        if (typeof delta !== "number") {
            throw "Error: 'inc' delta must be a number. Given: " + delta;
        }

        const initialValue: number | any = this.lookup(expr[1], env);

        if (typeof initialValue !== "number") {
            throw "Error: 'inc' initial value must be a number. Given: " + initialValue;
        }

        const value: number = initialValue + delta;

        this.setInEnv(expr[1], value, env);

        return value;
    }

    // (dec symbol delta)
    private evalDecrement(expr: any[], env: any[]): any {
        if (expr.length === 1 || expr.length > 3) {
            throw "Error: 'dec' requires 1 or 2 arguments. Given: " + (expr.length - 1);
        }

        if (typeof expr[1] !== "string") {
            throw "Error: 'dec' requires a symbol. Given: " + expr[1];
        }

        const delta: number | any = expr.length === 2
            ? 1
            : this.evalExpr(expr[2], env);

        if (typeof delta !== "number") {
            throw "Error: 'dec' delta must be a number. Given: " + delta;
        }

        const initialValue: number | any = this.lookup(expr[1], env);

        if (typeof initialValue !== "number") {
            throw "Error: 'dec' initial value must be a number. Given: " + initialValue;
        }

        const value: number = initialValue - delta;

        this.setInEnv(expr[1], value, env);

        return value;
    }

    // (defined symbol)
    private evalDefined(expr: any[], env: any[]): any {
        if (expr.length !== 2) {
            throw "Error: 'defined' requires 1 argument. Given: " + (expr.length - 1);
        }

        return this.isDefined(typeof expr[1] === "string"
                                ? expr[1]
                                : this.evalExpr(expr[1], env),
                            env);
    }

    // (value-of symbol)
    private evalValueOf(expr: any[], env: any[]): any {
        const [symbol] = <[string]>this.evalArgs(["string"], expr, env);

        return this.lookup(symbol, env);
    }

    // (block expr expr*)
    private evalBlock(expr: any[], env: any[]): any {
        if (expr.length === 1) {
            throw "Error: Empty block";
        }

        env.push(["#scope", "block"]);
        const scopeStart: number = env.length - 1;

        const res: any = expr.length === 2
            ? this.evalExpr(expr[1], env)
            : this.evalExprList(expr.slice(1), env);

        if ( Array.isArray(res) && res[0] === "closure" ) {
            env.splice(scopeStart, 1);
        } else {
            this.clearEnv("#scope", env);
        }

        return res;
    }

    // (break)
    private evalBreak(): string {
        return "break";
    }

    // (continue)
    private evalContinue(): string {
        return "continue";
    }

    // (collect expr+)
    private evalCollect(expr: any[], env: any[]): any[] {
        if (expr.length < 2) {
            throw "Error: 'collect' requires at least 1 expression.";
        }

        env.push(["#scope", "collect"]);
        env.push(["#collect", []]);

        this.evalExprList(expr.slice(1), env);

        const res: any[] = this.lookup("#collect", env);
        this.clearEnv("#scope", env);

        return res;
    }

    // (yield expr)
    private evalYield(expr: any[], env: any[]): void {
        if ( !this.isDefined("#collect", env) ) {
            throw "Error: 'yield' used out of 'collect'.";
        }

        const [element] = <[any]>this.evalArgs(["any"], expr, env);

        this.lookup("#collect", env).push(element);
    }

    // (lambda (par*)
    //     expr+)
    private evalLambda(expr: any[], env: any[]): any[] {
        if (expr.length < 3) {
            throw "Error: Improper function. Given: " + Printer.stringify(expr);
        }

        if ( !Array.isArray(expr[1]) ) {
            throw "Error: Improper function parameters. Given: " + Printer.stringify(expr);
        }

        // (closure (par*) (body+) env)
        return ["closure", expr[1], expr.slice(2), env];
    }

    // (if test-expr
    //     then-expr
    //     else-expr?)
    private evalIf(expr: any[], env: any[]): any {
        if (expr.length < 3 || expr.length > 4) {
            throw "Error: 'if' requires 2 or 3 arguments. Given: " + (expr.length - 1);
        }

        return this.evalExpr(expr[1], env)
            ? this.evalExpr(expr[2], env)
            : expr.length === 4
                ? this.evalExpr(expr[3], env)
                : undefined;
    }

    // (unless test-expr
    //         expr+)
    private evalUnless(expr: any[], env: any[]): void {
        if (expr.length === 1) {
            throw "Error: Empty 'unless'";
        }

        if (expr.length === 2) {
            throw "Error: Empty 'unless' body";
        }

        if ( this.evalExpr(expr[1], env) ) {
            return;
        }

        env.push(["#scope", "unless"]);

        if (expr.length === 3) {
            this.evalExpr(expr[2], env);
        } else {
            this.evalExprList(expr.slice(2), env);
        }

        this.clearEnv("#scope", env);
    }

    // (when test-expr
    //       expr+)
    private evalWhen(expr: any[], env: any[]): void {
        if (expr.length === 1) {
            throw "Error: Empty 'when'";
        }

        if (expr.length === 2) {
            throw "Error: Empty 'when' body";
        }

        if ( !this.evalExpr(expr[1], env) ) {
            return;
        }

        env.push(["#scope", "when"]);

        if (expr.length === 3) {
            this.evalExpr(expr[2], env);
        } else {
            this.evalExprList(expr.slice(2), env);
        }

        this.clearEnv("#scope", env);
    }

    // (cond
    //     (test-expr expr+)
    //     ...
    //     (else expr+))
    private evalCond(expr: any, env: any[]): any {
        const clauses: any[] = expr.slice(1);
        env.push(["#scope", "cond"]);

        for (const clause of clauses) {
            if (clause[0] === "else" || this.evalExpr(clause[0], env) ) {
                const res: any = clause.length === 2
                    ? this.evalExpr(clause[1], env)
                    : this.evalExprList(clause.slice(1), env);
                this.clearEnv("#scope", env);
                return res;
            }
        }

        this.clearEnv("#scope", env);

        return undefined;
    }

    // (case expr
    //     ((datum datum*) expr)
    //     ...
    //     (else     expr))
    private evalCase(expr: any, env: any[]): any {
        const key: any       = this.evalExpr(expr[1], env);
        const clauses: any[] = expr.slice(2);

        for (const clause of clauses) {
            const datum: any[] | string = clause[0];
            if (!Array.isArray(datum) && datum !== "else") {
                throw `Error: 'case' requires datum to be in a list. Given: ${Printer.stringify(datum)}`;
            }
            if (clause.length <= 1) {
                throw `Error: 'case' requires a clause with one or more expressions.`;
            }

            const isMatch = datum === "else" ||
                datum.some((e:any|any[]) => e === key || (e[0] === "string" && e[1] === key));

            if (isMatch) {
                env.push(["#scope", "case"]);
                const res: any = clause.length === 2
                        ? this.evalExpr(clause[1], env)
                        : this.evalExprList(clause.slice(1), env);
                this.clearEnv("#scope", env);
                return res;
            }
        }

        return undefined;
    }

    // (for symbol range
    //     expr
    //     expr*)
    private evalFor(expr: any[], env: any[]): void {
        const symbol: string  = expr[1];
        const range: any[]    = this.evalExpr(expr[2], env);
        const loopBody: any[] = expr.slice(3);

        if ( !Array.isArray(range) ) {
            throw `Error: 'for' no range provided. Given: ` + Printer.stringify(range);
        }

        for (const elem of range) {
            env.push(["#scope", "for"]);
            this.addToEnv(symbol, elem, "let", env);

            for (const bodyExpr of loopBody) {
                const res: any = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break") {
                    this.clearEnv("#scope", env);
                    return;
                }
            }

            this.clearEnv("#scope", env);
        }
    }

    // (while test-expr
    //     expr+)
    private evalWhile(expr: any[], env: any[]): void {
        const testExpr: any = expr[1];
        const loopBody: any = expr.slice(2);

        while ( this.evalExpr(testExpr, env) ) {
            env.push(["#scope", "while"]);

            for (const bodyExpr of loopBody) {
                const res: any = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break") {
                    this.clearEnv("#scope", env);
                    return;
                }
            }

            this.clearEnv("#scope", env);
        }
    }

    // (do
    //     expr+
    //     test-expr)
    private evalDo(expr: any[], env: any[]): void {
        const testExpr: any = expr[expr.length - 1];
        const loopBody: any = expr.slice(1, expr.length - 1);

        do {
            env.push(["#scope", "do"]);

            for (const bodyExpr of loopBody) {
                const res: any = this.evalExpr(bodyExpr, env);
                if (res === "continue") break;
                if (res === "break") {
                    this.clearEnv("#scope", env);
                    return;
                }
            }

            this.clearEnv("#scope", env);
        } while ( this.evalExpr(testExpr, env) );
    }

    // (enum symbol symbol*)
    private evalEnum(expr: any[], env: any[]): void {
        for (let i: number = 1; i < expr.length; i++) {
            this.addToEnv(expr[i], i - 1, "const", env);
        }
    }

    // (apply symbol (list arg*) | expr)
    private evalApply(expr: any[], env: any[]): any {
        const procId: string = expr[1];
        const callArgs: any[] = Array.isArray(expr[2]) && expr[2][0] === "list"
            ? expr[2].slice(1)
            : this.evalExpr(expr[2], env);

        for (let i: number = 0; i < callArgs.length; i++) {
            const arg: any = callArgs[i];
            if (typeof arg === "string" && !["true", "false", "null"].includes(arg) ) {
                callArgs[i] = ["string", arg];
            } else if (arg === true) {
                callArgs[i] = "true";
            } else if (arg === false) {
                callArgs[i] = "false";
            } else if (arg === null) {
                callArgs[i] = "null";
            }
        }

        return this.evalExpr([procId, ...callArgs], env);
    }

    // (and)            => true
    // (and expr)       => expr
    // (and expr expr*) => the first faulty or the last one
    private evalAnd(expr: any[], env: any[]): boolean {
        switch (expr.length) {
            case 1: return true;
            case 2: return this.evalExpr(expr[1], env);
            case 3: return this.evalExpr(expr[1], env) && this.evalExpr(expr[2], env);
        }

        return this.evalExpr(expr[1], env) && this.evalAnd(expr.slice(1), env);
    }

    // (repeat count expr+) => undefined
    private evalRepeat(expr: any[], env: any[]): void {
        if (expr.length < 3) {
            throw "Error: 'repeat' requires at least 2 expressions. Given: " + (expr.length - 1);
        }

        const count: number = this.evalExpr(expr[1], env);

        for (let i: number = 0; i < count; i++) {
            env.push(["#scope", "repeat"]);

            this.evalExprList(expr.slice(2), env);

            this.clearEnv("#scope", env);
        }
    }

    // (quote obj) => obj
    private evalQuote(expr: any[]): any {
        if (expr.length !== 2) {
            throw "Error: 'quote' requires 1 argument. Given: " + (expr.length - 1);
        }

        return expr[1];
    }

    // (quasiquote obj) => obj
    private evalQuasiquote(expr: any[], env: any[]): any {
        if (expr.length !== 2) {
            throw "Error: 'quasiquote' requires 1 argument. Given: " + (expr.length - 1);
        }

        const isUnquote         = (obj: any): boolean => obj === ",";
        const isUnquoteSplicing = (obj: any): boolean => obj === "@";

        const datum: any    = expr[1];
        const output: any[] = [];

        for (let i: number = 0; i < datum.length; i++) {
            if (i > 0 && isUnquote(datum[i - 1]) ) {
                output.push( this.evalExpr(datum[i], env) );
            }
            else if (i > 0 && isUnquoteSplicing(datum[i - 1]) ) {
                output.push( ... this.evalExpr(datum[i], env) );
            }
            else if ( !isUnquote(datum[i]) && !isUnquoteSplicing(datum[i]) ) {
                output.push(datum[i]);
            }
        }

        return output;
    }

    // (or)            => false
    // (or expr)       => expr
    // (or expr expr*) => the first truthy or the last one
    private evalOr(expr: any[], env: any[]): any {
        switch (expr.length) {
            case 1: return false;
            case 2: return this.evalExpr(expr[1], env);
            case 3: return this.evalExpr(expr[1], env) || this.evalExpr(expr[2], env);
        }

        return this.evalExpr(expr[1], env) || this.evalOr(expr.slice(1), env);
    }

    // (try catch-expr
    //     expr+)
    private evalTry(expr: any[], env: any[]): any {
        try {
            env.push(["#scope", "try"]);
            const res = expr.length === 3
                ? this.evalExpr(expr[2], env)
                : this.evalExprList(expr.slice(2), env);
            this.clearEnv("#scope", env);
            return res;
        } catch (e) {
            this.clearEnv("#scope", env);
            return this.evalCatch(expr[1], String(e), env);
        }
    }

    private evalCatch(catchExpr: any, errorMessage: string, env: any[]): any {
        const catchType: string = typeof catchExpr;
        if (catchType === "number") {
            return catchExpr;
        }

        if (catchType === "string") {
            switch (catchExpr) {
                case "null"  : return null;
                case "true"  : return true;
                case "false" : return false;
            }

            // Call function
            return this.evalApplication([catchExpr, ["string", errorMessage]], env);
        }

        if (Array.isArray(catchExpr)) {
            if (catchExpr[0] === "lambda") {
                return this.evalApplication([catchExpr, ["string", errorMessage]], env);
            }

            if (catchExpr[0] === "string") {
                return catchExpr[1];
            }
        }

        return this.evalExpr(catchExpr, env);
    }

    // (throw expr)
    private evalThrow(expr: any[], env: any[]): never {
        throw this.evalExpr(expr[1], env);
    }

    // (debug)
    // noinspection JSUnusedLocalSymbols
    private evalDebug(expr: any[], env: any): void {
        this.isDebug = true;

        const envDumpList: string[] = [];
        for (let i = Math.min(env.length - 1, 20); i > -1; i--) {
            envDumpList.push(`${env[i][0]} = ${Printer.stringify(env[i][1]).substr(0, 500)}`);
        }

        this.options.printer(`Environment:\n${ envDumpList.join("\n") }\n`);
    }

    // (type-of obj)
    private  evalTypeOf(expr: any[], env: any[]): string {
        if (expr.length !== 2) {
            throw "Error: 'type-of' requires 1 argument. Given: " + (expr.length - 1);
        }

        const entity = expr[1];

        if ( Array.isArray(entity) ) {
            switch (entity[0]) {
                case "list"    : return "list";
                case "string"  : return "string";
                case "lambda"  :
                case "closure" : return "function";
            }
        }

        if (entity === "null") {
            return "null";
        }

        const value = this.evalExpr(entity, env);

        if ( Array.isArray(value) ) {
            switch (value[0]) {
                case "lambda"  :
                case "closure" : return "function";
            }

            return "list";
        }

        if (value === null) {
            return "null";
        }

        return typeof value;
    }

    // (parse src)
    private evalParse(expr: any[], env: any[]): any[] {
        const [scr] = <[string]>this.evalArgs(["string"], expr, env);

        return new Parser().parse(scr);
    }

    // (eval src)
    private evalEval(expr: any[], env: any[]): any[] {
        const [obj] = <[any]>this.evalArgs(["any"], expr, env);

        return this.evalCodeTree(obj, this.options);
    }

    // (print expr1 expr2 ...)
    private evalPrint(expr: any[], env: any[]): void {
        if (expr.length === 1) {
            this.options.printer("\r\n");
        } else if (expr.length === 2) {
            const text: string = Printer.stringify( this.evalExpr(expr[1], env) );
            this.options.printer( text + "\r\n");
        } else {
            const text: string = this.mapExprList(expr.slice(1), env)
                .map(Printer.stringify)
                .join(" ");
            this.options.printer(text + "\r\n");
        }
    }

    // (display expr)
    private evalDisplay(expr: any[], env: any[]): void {
        const [obj] = <[any]>this.evalArgs(["any"], expr, env);

        this.options.printer( Printer.stringify(obj) );
    }

    // (newline)
    private evalNewline(expr: any[], env: any[]): void {
        this.evalArgs([], expr, env);

        this.options.printer("\r\n");
    }

    private dumpExpression(expr: any[]): void {
        this.options.printer( `Expression:\n${Printer.stringify(expr)}\n` );
    }

    private assertArity(expr: any[], argsCount: number, optionalCount: number): void {
        const argText = (count: number) => count === 1
            ? "1 argument"
            : count + " arguments";

        if (optionalCount === 0 && expr.length !== argsCount + 1) {
            throw `Error: '${expr[0]}' requires ${argText(argsCount)}. Given: ${argText(expr.length - 1)}`;
        } else if (optionalCount !== 0 &&
            (expr.length  - 1 < argsCount - optionalCount || expr.length - 1 > argsCount)) {
            throw `Error: '${expr[0]}' requires from ${argText(argsCount - optionalCount)} to ${argText(argsCount)}.` +
            ` Given: ${argText(expr.length - 1)}`;
        }
    }

    private assertArgType(name: string, arg: any, argType: string): void {
        if ( !this.assertType(arg, argType) ) {
            throw `Error: '${name}' requires ${argType}. Given: ${typeof arg} ${this.argToStr(arg)}`;
        }
    }

    private argToStr(arg: any): string {
        const maxLength: number = 25;
        const argText: string   = Printer.stringify(arg);
        return argText.length > maxLength
            ? argText.substring(0, maxLength) + "..."
            : argText;
    }

    private manageImport_ready(callback: Function, codeTree: any[]): any {
        callback( this.evalExprList(codeTree, []) );
    }
}
