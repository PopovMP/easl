"use strict";
class Easl {
    constructor() {
    }
    evaluate(codeText, optionsParam, callback) {
        const options = optionsParam ? Options.parse(optionsParam) : new Options();
        const parser = new Parser();
        const interpreter = new Interpreter();
        try {
            const ilCode = parser.parse(codeText);
            return interpreter.evalCodeTree(ilCode, options, callback);
        }
        catch (e) {
            if (typeof callback === "function") {
                callback(e.toString());
            }
            else {
                return e.toString();
            }
        }
    }
}
if (typeof module === "object") {
    module.exports.Easl = Easl;
}
class Interpreter {
    constructor() {
        this.builtinHash = {};
        this.specialForms = {
            "and": this.evalAnd,
            "apply": this.evalApply,
            "block": this.evalBlock,
            "break": this.evalBreak,
            "case": this.evalCase,
            "cond": this.evalCond,
            "const": this.evalConst,
            "continue": this.evalContinue,
            "debug": this.evalDebug,
            "dec": this.evalDecrement,
            "defined": this.evalDefined,
            "delete": this.evalDelete,
            "display": this.evalDisplay,
            "do": this.evalDo,
            "enum": this.evalEnum,
            "eval": this.evalEval,
            "for": this.evalFor,
            "if": this.evalIf,
            "inc": this.evalIncrement,
            "lambda": this.evalLambda,
            "let": this.evalLet,
            "newline": this.evalNewline,
            "or": this.evalOr,
            "parse": this.evalParse,
            "print": this.evalPrint,
            "quasiquote": this.evalQuasiquote,
            "quote": this.evalQuote,
            "set": this.evalSet,
            "string": this.evalString,
            "throw": this.evalThrow,
            "try": this.evalTry,
            "type-of": this.evalTypeOf,
            "unless": this.evalUnless,
            "value-of": this.evalValueOf,
            "when": this.evalWhen,
            "while": this.evalWhile,
        };
        this.isDebug = false;
        this.libs = [];
        this.options = new Options();
        for (const form of Object.keys(this.specialForms)) {
            this.builtinHash[form] = true;
        }
    }
    evalCodeTree(codeTree, options, callback) {
        this.options = options;
        this.libs.push(...LibManager.getBuiltinLibs(options.libs, this));
        if (typeof callback === "function") {
            LibManager.manageImports(codeTree, this.manageImport_ready.bind(this, callback));
        }
        else {
            return this.evalExprList(codeTree, []);
        }
    }
    evalExprList(exprLst, env) {
        let res;
        for (const expr of exprLst) {
            res = this.evalExpr(expr, env);
        }
        return res;
    }
    mapExprList(exprLst, env) {
        const res = [];
        for (const expr of exprLst) {
            res.push(this.evalExpr(expr, env));
        }
        return res;
    }
    evalExpr(expr, env) {
        switch (expr) {
            case "null": return null;
            case "true": return true;
            case "false": return false;
        }
        switch (typeof expr) {
            case "number": return expr;
            case "string": return this.lookup(expr, env);
        }
        if (this.isDebug) {
            this.isDebug = false;
            this.dumpExpression(expr);
        }
        const form = expr[0];
        if (form === undefined) {
            throw "Error: Improper function application. Probably: ()";
        }
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
        return this.evalApplication(expr, env);
    }
    evalArgs(argTypes, expr, env) {
        const optionalCount = argTypes.filter(Array.isArray).length;
        this.assertArity(expr, argTypes.length, optionalCount);
        return argTypes.map((argType, index) => {
            const isRequired = !Array.isArray(argType);
            const arg = isRequired || index + 1 < expr.length
                ? this.evalExpr(expr[index + 1], env)
                : argTypes[index][1];
            this.assertArgType(expr[0], arg, (isRequired ? argType : argType[0]));
            return arg;
        });
    }
    assertType(arg, argType) {
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
    addToEnv(symbol, value, modifier, env) {
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
    setInEnv(symbol, value, env) {
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
    lookup(symbol, env) {
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
    isDefined(symbol, env) {
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
    clearEnv(tag, env) {
        let cell;
        do {
            cell = env.pop();
        } while (cell[0] !== tag);
    }
    evalApplication(expr, env) {
        const proc = expr[0];
        const isNamed = typeof proc === "string";
        const procId = isNamed ? proc : proc[0];
        const closure = isNamed
            ? this.lookup(proc, env)
            : this.evalExpr(proc, env);
        if (typeof closure === "string" && this.isDefined(closure, env)) {
            return this.evalExpr([this.evalExpr(closure, env), ...expr.slice(1)], env);
        }
        if (!Array.isArray(closure) || closure[0] !== "closure") {
            throw `Error: Improper function application. Given: ${Printer.stringify(closure)}`;
        }
        const args = expr.length === 1
            ? []
            : expr.length === 2
                ? [this.evalExpr(expr[1], env)]
                : this.mapExprList(expr.slice(1), env);
        const params = closure[1];
        const body = closure[2];
        const closureEnv = closure[3].concat([["#scope", procId], ["#args", args], ["#name", procId]]);
        const scopeStart = closureEnv.length - 1;
        this.evalListDestructuring(params, args, "arg", closureEnv);
        const res = this.evalExprList(body, closureEnv);
        if (Array.isArray(res) && res[0] === "closure") {
            closureEnv.splice(scopeStart, 1);
        }
        else {
            this.clearEnv("#scope", closureEnv);
        }
        return res;
    }
    evalString(expr) {
        if (expr.length !== 2) {
            throw "Error: 'string' requires 1 argument. Given: " + (expr.length - 1);
        }
        return expr[1];
    }
    evalLet(expr, env) {
        this.evalLetConst(expr, env, "let");
    }
    evalConst(expr, env) {
        this.evalLetConst(expr, env, "const");
    }
    evalLetConst(expr, env, modifier) {
        if (expr.length === 3 && Array.isArray(expr[1])) {
            this.evalListDestructuring(expr[1], this.evalExpr(expr[2], env), modifier, env);
            return;
        }
        if (!Array.isArray(expr[2]) && expr.length !== 3) {
            throw "Error: '" + modifier + "' requires a symbol and a value.";
        }
        const param = expr.length === 3
            ? expr[2]
            : ["lambda", expr[2], ...expr.slice(3)];
        const value = this.evalExpr(param, env);
        this.addToEnv(expr[1], value, modifier, env);
    }
    evalListDestructuring(params, args, modifier, env) {
        if (!Array.isArray(args)) {
            throw "Error: list destructuring requires one iterable argument.";
        }
        const restIndex = params.indexOf(".");
        for (let i = 0; i < params.length && i !== restIndex; i++) {
            const isParamArray = Array.isArray(params[i]);
            const param = isParamArray ? params[i][0] : params[i];
            const value = typeof args[i] === "undefined"
                ? isParamArray
                    ? this.evalExpr(params[i][1], env)
                    : `Error: cannot set unspecified value to parameter: ${param}.`
                : args[i];
            this.addToEnv(param, value, modifier, env);
        }
        if (restIndex > -1) {
            const param = params[restIndex + 1];
            const value = args.length < restIndex
                ? []
                : args.slice(restIndex);
            this.addToEnv(param, value, modifier, env);
        }
    }
    evalSet(expr, env) {
        if (expr.length !== 3) {
            throw "Error: 'set' requires 2 arguments. Given: " + (expr.length - 1);
        }
        this.setInEnv(expr[1], this.evalExpr(expr[2], env), env);
    }
    evalDelete(expr, env) {
        if (expr.length !== 2) {
            throw "Error: 'delete' requires 1 argument. Given: " + (expr.length - 1);
        }
        const symbol = expr[1];
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
    evalIncrement(expr, env) {
        if (expr.length === 1 || expr.length > 3) {
            throw "Error: 'inc' requires 1 or 2 arguments. Given: " + (expr.length - 1);
        }
        if (typeof expr[1] !== "string") {
            throw "Error: 'inc' requires a symbol. Given: " + expr[1];
        }
        const delta = expr.length === 2
            ? 1
            : this.evalExpr(expr[2], env);
        if (typeof delta !== "number") {
            throw "Error: 'inc' delta must be a number. Given: " + delta;
        }
        const initialValue = this.lookup(expr[1], env);
        if (typeof initialValue !== "number") {
            throw "Error: 'inc' initial value must be a number. Given: " + initialValue;
        }
        const value = initialValue + delta;
        this.setInEnv(expr[1], value, env);
        return value;
    }
    evalDecrement(expr, env) {
        if (expr.length === 1 || expr.length > 3) {
            throw "Error: 'dec' requires 1 or 2 arguments. Given: " + (expr.length - 1);
        }
        if (typeof expr[1] !== "string") {
            throw "Error: 'dec' requires a symbol. Given: " + expr[1];
        }
        const delta = expr.length === 2
            ? 1
            : this.evalExpr(expr[2], env);
        if (typeof delta !== "number") {
            throw "Error: 'dec' delta must be a number. Given: " + delta;
        }
        const initialValue = this.lookup(expr[1], env);
        if (typeof initialValue !== "number") {
            throw "Error: 'dec' initial value must be a number. Given: " + initialValue;
        }
        const value = initialValue - delta;
        this.setInEnv(expr[1], value, env);
        return value;
    }
    evalDefined(expr, env) {
        if (expr.length !== 2) {
            throw "Error: 'defined' requires 1 argument. Given: " + (expr.length - 1);
        }
        return this.isDefined(typeof expr[1] === "string"
            ? expr[1]
            : this.evalExpr(expr[1], env), env);
    }
    evalValueOf(expr, env) {
        const [symbol] = this.evalArgs(["string"], expr, env);
        return this.lookup(symbol, env);
    }
    evalBlock(expr, env) {
        if (expr.length === 1) {
            throw "Error: Empty block";
        }
        env.push(["#scope", "block"]);
        const scopeStart = env.length - 1;
        const res = expr.length === 2
            ? this.evalExpr(expr[1], env)
            : this.evalExprList(expr.slice(1), env);
        if (Array.isArray(res) && res[0] === "closure") {
            env.splice(scopeStart, 1);
        }
        else {
            this.clearEnv("#scope", env);
        }
        return res;
    }
    evalBreak() {
        return "break";
    }
    evalContinue() {
        return "continue";
    }
    evalLambda(expr, env) {
        if (expr.length < 3) {
            throw "Error: Improper function. Given: " + Printer.stringify(expr);
        }
        if (!Array.isArray(expr[1])) {
            throw "Error: Improper function parameters. Given: " + Printer.stringify(expr);
        }
        return ["closure", expr[1], expr.slice(2), env];
    }
    evalIf(expr, env) {
        if (expr.length < 3 || expr.length > 4) {
            throw "Error: 'if' requires 2 or 3 arguments. Given: " + (expr.length - 1);
        }
        return this.evalExpr(expr[1], env)
            ? this.evalExpr(expr[2], env)
            : expr.length === 4
                ? this.evalExpr(expr[3], env)
                : undefined;
    }
    evalUnless(expr, env) {
        if (expr.length === 1) {
            throw "Error: Empty 'unless'";
        }
        if (expr.length === 2) {
            throw "Error: Empty 'unless' body";
        }
        if (this.evalExpr(expr[1], env)) {
            return;
        }
        env.push(["#scope", "unless"]);
        if (expr.length === 3) {
            this.evalExpr(expr[2], env);
        }
        else {
            this.evalExprList(expr.slice(2), env);
        }
        this.clearEnv("#scope", env);
    }
    evalWhen(expr, env) {
        if (expr.length === 1) {
            throw "Error: Empty 'when'";
        }
        if (expr.length === 2) {
            throw "Error: Empty 'when' body";
        }
        if (!this.evalExpr(expr[1], env)) {
            return;
        }
        env.push(["#scope", "when"]);
        if (expr.length === 3) {
            this.evalExpr(expr[2], env);
        }
        else {
            this.evalExprList(expr.slice(2), env);
        }
        this.clearEnv("#scope", env);
    }
    evalCond(expr, env) {
        const clauses = expr.slice(1);
        env.push(["#scope", "cond"]);
        for (const clause of clauses) {
            if (clause[0] === "else" || this.evalExpr(clause[0], env)) {
                const res = clause.length === 2
                    ? this.evalExpr(clause[1], env)
                    : this.evalExprList(clause.slice(1), env);
                this.clearEnv("#scope", env);
                return res;
            }
        }
        this.clearEnv("#scope", env);
        return undefined;
    }
    evalCase(expr, env) {
        const key = this.evalExpr(expr[1], env);
        const clauses = expr.slice(2);
        for (const clause of clauses) {
            const datum = clause[0];
            if (!Array.isArray(datum) && datum !== "else") {
                throw `Error: 'case' requires datum to be in a list. Given: ${Printer.stringify(datum)}`;
            }
            if (clause.length <= 1) {
                throw `Error: 'case' requires a clause with one or more expressions.`;
            }
            const isMatch = datum === "else" ||
                datum.some((e) => e === key || (e[0] === "string" && e[1] === key));
            if (isMatch) {
                env.push(["#scope", "case"]);
                const res = clause.length === 2
                    ? this.evalExpr(clause[1], env)
                    : this.evalExprList(clause.slice(1), env);
                this.clearEnv("#scope", env);
                return res;
            }
        }
        return undefined;
    }
    evalFor(expr, env) {
        const symbol = expr[1];
        const range = this.evalExpr(expr[2], env);
        const loopBody = expr.slice(3);
        if (!Array.isArray(range)) {
            throw `Error: 'for' no range provided. Given: ` + Printer.stringify(range);
        }
        for (const elem of range) {
            env.push(["#scope", "for"]);
            this.addToEnv(symbol, elem, "let", env);
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue")
                    break;
                if (res === "break") {
                    this.clearEnv("#scope", env);
                    return;
                }
            }
            this.clearEnv("#scope", env);
        }
    }
    evalWhile(expr, env) {
        const testExpr = expr[1];
        const loopBody = expr.slice(2);
        while (this.evalExpr(testExpr, env)) {
            env.push(["#scope", "while"]);
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue")
                    break;
                if (res === "break") {
                    this.clearEnv("#scope", env);
                    return;
                }
            }
            this.clearEnv("#scope", env);
        }
    }
    evalDo(expr, env) {
        const testExpr = expr[expr.length - 1];
        const loopBody = expr.slice(1, expr.length - 1);
        do {
            env.push(["#scope", "do"]);
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue")
                    break;
                if (res === "break") {
                    this.clearEnv("#scope", env);
                    return;
                }
            }
            this.clearEnv("#scope", env);
        } while (this.evalExpr(testExpr, env));
    }
    evalEnum(expr, env) {
        for (let i = 1; i < expr.length; i++) {
            this.addToEnv(expr[i], i - 1, "const", env);
        }
    }
    evalApply(expr, env) {
        const procId = expr[1];
        const callArgs = Array.isArray(expr[2]) && expr[2][0] === "list"
            ? expr[2].slice(1)
            : this.evalExpr(expr[2], env);
        for (let i = 0; i < callArgs.length; i++) {
            const arg = callArgs[i];
            if (typeof arg === "string" && !["true", "false", "null"].includes(arg)) {
                callArgs[i] = ["string", arg];
            }
            else if (arg === true) {
                callArgs[i] = "true";
            }
            else if (arg === false) {
                callArgs[i] = "false";
            }
            else if (arg === null) {
                callArgs[i] = "null";
            }
        }
        return this.evalExpr([procId, ...callArgs], env);
    }
    evalAnd(expr, env) {
        switch (expr.length) {
            case 1: return true;
            case 2: return this.evalExpr(expr[1], env);
            case 3: return this.evalExpr(expr[1], env) && this.evalExpr(expr[2], env);
        }
        return this.evalExpr(expr[1], env) && this.evalAnd(expr.slice(1), env);
    }
    evalQuote(expr) {
        if (expr.length !== 2) {
            throw "Error: 'quote' requires 1 argument. Given: " + (expr.length - 1);
        }
        return expr[1];
    }
    evalQuasiquote(expr, env) {
        if (expr.length !== 2) {
            throw "Error: 'quasiquote' requires 1 argument. Given: " + (expr.length - 1);
        }
        const isUnquote = (obj) => obj === ",";
        const isUnquoteSplicing = (obj) => obj === "@";
        const datum = expr[1];
        const output = [];
        for (let i = 0; i < datum.length; i++) {
            if (i > 0 && isUnquote(datum[i - 1])) {
                output.push(this.evalExpr(datum[i], env));
            }
            else if (i > 0 && isUnquoteSplicing(datum[i - 1])) {
                output.push(...this.evalExpr(datum[i], env));
            }
            else if (!isUnquote(datum[i]) && !isUnquoteSplicing(datum[i])) {
                output.push(datum[i]);
            }
        }
        return output;
    }
    evalOr(expr, env) {
        switch (expr.length) {
            case 1: return false;
            case 2: return this.evalExpr(expr[1], env);
            case 3: return this.evalExpr(expr[1], env) || this.evalExpr(expr[2], env);
        }
        return this.evalExpr(expr[1], env) || this.evalOr(expr.slice(1), env);
    }
    evalTry(expr, env) {
        try {
            env.push(["#scope", "try"]);
            const res = expr.length === 3
                ? this.evalExpr(expr[2], env)
                : this.evalExprList(expr.slice(2), env);
            this.clearEnv("#scope", env);
            return res;
        }
        catch (e) {
            this.clearEnv("#scope", env);
            return this.evalCatch(expr[1], String(e), env);
        }
    }
    evalCatch(catchExpr, errorMessage, env) {
        const catchType = typeof catchExpr;
        if (catchType === "number") {
            return catchExpr;
        }
        if (catchType === "string") {
            switch (catchExpr) {
                case "null": return null;
                case "true": return true;
                case "false": return false;
            }
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
    evalThrow(expr, env) {
        throw this.evalExpr(expr[1], env);
    }
    evalDebug(expr, env) {
        this.isDebug = true;
        const envDumpList = [];
        for (let i = Math.min(env.length - 1, 20); i > -1; i--) {
            envDumpList.push(`${env[i][0]} = ${Printer.stringify(env[i][1]).substr(0, 500)}`);
        }
        this.options.printer(`Environment:\n${envDumpList.join("\n")}\n`);
    }
    evalTypeOf(expr, env) {
        if (expr.length !== 2) {
            throw "Error: 'type-of' requires 1 argument. Given: " + (expr.length - 1);
        }
        const entity = expr[1];
        if (Array.isArray(entity)) {
            switch (entity[0]) {
                case "list": return "list";
                case "string": return "string";
                case "lambda":
                case "closure": return "function";
            }
        }
        if (entity === "null") {
            return "null";
        }
        const value = this.evalExpr(entity, env);
        if (Array.isArray(value)) {
            switch (value[0]) {
                case "lambda":
                case "closure": return "function";
            }
            return "list";
        }
        if (value === null) {
            return "null";
        }
        return typeof value;
    }
    evalParse(expr, env) {
        const [scr] = this.evalArgs(["string"], expr, env);
        return new Parser().parse(scr);
    }
    evalEval(expr, env) {
        const [obj] = this.evalArgs(["any"], expr, env);
        return this.evalCodeTree(obj, this.options);
    }
    evalPrint(expr, env) {
        if (expr.length === 1) {
            this.options.printer("\r\n");
        }
        else if (expr.length === 2) {
            const text = Printer.stringify(this.evalExpr(expr[1], env));
            this.options.printer(text + "\r\n");
        }
        else {
            const text = this.mapExprList(expr.slice(1), env)
                .map(Printer.stringify)
                .join(" ");
            this.options.printer(text + "\r\n");
        }
    }
    evalDisplay(expr, env) {
        const [obj] = this.evalArgs(["any"], expr, env);
        this.options.printer(Printer.stringify(obj));
    }
    evalNewline(expr, env) {
        this.evalArgs([], expr, env);
        this.options.printer("\r\n");
    }
    dumpExpression(expr) {
        this.options.printer(`Expression:\n${Printer.stringify(expr)}\n`);
    }
    assertArity(expr, argsCount, optionalCount) {
        const argText = (count) => count === 1
            ? "1 argument"
            : count + " arguments";
        if (optionalCount === 0 && expr.length !== argsCount + 1) {
            throw `Error: '${expr[0]}' requires ${argText(argsCount)}. Given: ${argText(expr.length - 1)}`;
        }
        else if (optionalCount !== 0 &&
            (expr.length - 1 < argsCount - optionalCount || expr.length - 1 > argsCount)) {
            throw `Error: '${expr[0]}' requires from ${argText(argsCount - optionalCount)} to ${argText(argsCount)}.` +
                ` Given: ${argText(expr.length - 1)}`;
        }
    }
    assertArgType(name, arg, argType) {
        if (!this.assertType(arg, argType)) {
            throw `Error: '${name}' requires ${argType}. Given: ${typeof arg} ${this.argToStr(arg)}`;
        }
    }
    argToStr(arg) {
        const maxLength = 25;
        const argText = Printer.stringify(arg);
        return argText.length > maxLength
            ? argText.substring(0, maxLength) + "..."
            : argText;
    }
    manageImport_ready(callback, codeTree) {
        callback(this.evalExprList(codeTree, []));
    }
}
const XMLHttpRequestLib = (typeof XMLHttpRequest === "function")
    ? XMLHttpRequest
    : require("xmlhttprequest").XMLHttpRequest;
const localStorageLib = (typeof localStorage === "object" && localStorage !== null)
    ? localStorage
    : new (require("node-localstorage").LocalStorage)("./easl-local-storage");
class IoService {
    static get(url, callback) {
        const xmlHttp = new XMLHttpRequestLib();
        xmlHttp.onreadystatechange = readyStateChange;
        xmlHttp.onerror = error;
        xmlHttp.open("GET", url, true);
        xmlHttp.send();
        function readyStateChange() {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                callback(xmlHttp.responseText);
            }
        }
        function error(e) {
            throw "Error: GET: " + url + ", " + e.message;
        }
    }
    static setItemToLocalStorage(key, item) {
        try {
            if (typeof item === "string") {
                localStorageLib.setItem(key, item);
            }
            else {
                localStorageLib.setItem(key, JSON.stringify(item));
            }
        }
        catch (e) {
            throw "Error: Set item to local storage: " + key + ", " + e.message;
        }
    }
    static getItemFromLocalStorage(key) {
        try {
            const value = localStorageLib.getItem(key);
            return value && JSON.parse(value);
        }
        catch (e) {
            throw "Error: Get item to local storage: " + key + ", " + e.message;
        }
    }
}
class LibManager {
    static getBuiltinLibs(libList, inter) {
        return libList.map(lib => LibManager.createLib(lib, inter));
    }
    static createLib(libName, inter) {
        switch (libName) {
            case "core-lib": return new CoreLib(inter);
            case "date-lib": return new DateLib(inter);
            case "ext-lib": return new ExtLib(inter);
            case "list-lib": return new ListLib(inter);
            case "math-lib": return new MathLib(inter);
            case "number-lib": return new NumberLib(inter);
            case "string-lib": return new StringLib(inter);
            default: throw "Error: Unknown lib: " + libName;
        }
    }
    static manageImports(codeTree, callback) {
        const code = [];
        let currentCodeIndex = 0;
        searchImports(currentCodeIndex);
        function searchImports(index) {
            for (let i = index; i < codeTree.length; i++) {
                const expr = codeTree[i];
                if (Array.isArray(expr) && expr[0] === "import") {
                    currentCodeIndex = i;
                    const libUrl = expr[1][1];
                    LibManager.importLibrary(libUrl, libManager_import_ready);
                    return;
                }
                else {
                    code.push(expr);
                }
            }
            callback(code);
        }
        function libManager_import_ready(libCodeTree) {
            code.push(...libCodeTree);
            searchImports(currentCodeIndex + 1);
        }
    }
    static importLibrary(libUrl, callback) {
        if (typeof libUrl !== "string" || libUrl.length === 0) {
            throw "Error: Empty library name";
        }
        const storedLib = IoService.getItemFromLocalStorage(libUrl);
        if (Array.isArray(storedLib) && storedLib.length > 0) {
            callback(storedLib);
            return;
        }
        const libName = libUrl.substring(libUrl.lastIndexOf('/') + 1);
        IoService.get(libUrl, ioService_get_ready);
        function ioService_get_ready(libText) {
            if (typeof libUrl !== "string" || libUrl.length === 0) {
                throw "Error: Cannot load library content: " + libName;
            }
            const parser = new Parser();
            const libCode = parser.parse(libText);
            IoService.setItemToLocalStorage(libUrl, libCode);
            callback(libCode);
        }
    }
}
class Options {
    constructor() {
        this.printer = console.log;
        this.libs = ["core-lib", "date-lib", "ext-lib", "list-lib", "math-lib", "number-lib", "string-lib"];
        this.extContext = this;
        this.extFunctions = {};
    }
    static parse(options) {
        const evalOptions = new Options();
        if (typeof options.printer === "function") {
            evalOptions.printer = options.printer;
        }
        if (Array.isArray(options.libs)) {
            evalOptions.libs = options.libs.slice();
        }
        if (options.extContext) {
            evalOptions.extContext = options.extContext;
        }
        if (options.extFunctions) {
            evalOptions.extFunctions = options.extFunctions;
        }
        return evalOptions;
    }
}
class Parser {
    constructor() {
        this.isOpenParen = (ch) => ["(", "[", "{"].includes(ch);
        this.isCloseParen = (ch) => [")", "]", "}"].includes(ch);
        this.isDelimiter = (ch) => ["(", ")", "[", "]", "{", "}", "'", "`", ","].includes(ch);
        this.isWhiteSpace = (ch) => [" ", "\t", "\r", "\n"].includes(ch);
        this.isLineComment = (ch) => ch === ";";
        this.isTextNumber = (tx) => /^[-+]?\d+(?:\.\d+)*$/.test(tx);
    }
    parse(codeText) {
        const fixedText = codeText
            .replace(/λ/g, "lambda")
            .replace(/'\([ \t\r\n]*\)/g, "(list)")
            .replace(/\(string[ \t\r\n]*\)/g, '""')
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
            .replace(/\\"/g, '""');
        const abbrevList = [["'", "quote"], ["`", "quasiquote"]];
        const codeList = this.tokenize(fixedText);
        const abbrevResolved = this.expandAbbreviations(codeList, abbrevList);
        const pipesResolved = this.expandPipeLeft(abbrevResolved, "<<");
        const ilTree = this.nest(pipesResolved);
        return ilTree;
    }
    expandAbbreviations(codeList, abbrevList) {
        if (abbrevList.length === 0) {
            return codeList;
        }
        const abbrev = abbrevList[0];
        const expandedSymbols = this.expandSymbolAbbreviation(codeList, abbrev[0], abbrev[1]);
        const expandedLists = this.expandListAbbreviation(expandedSymbols, abbrev[0], abbrev[1]);
        return this.expandAbbreviations(expandedLists, abbrevList.slice(1));
    }
    tokenize(code) {
        const isInFile = (i) => i < code.length;
        const isInLine = (i) => code[i] !== "\n" && code[i] !== undefined;
        const isOpenRangeComment = (i) => code[i] + code[i + 1] === "#|";
        const isCloseRangeComment = (i) => code[i - 1] + code[i] === "|#";
        const isStringChar = (ch) => ch === "\"";
        const output = [];
        const pushLexeme = (lexeme) => {
            if (lexeme === "")
                return;
            output.push(this.isTextNumber(lexeme) ? Number(lexeme) : lexeme);
        };
        for (let i = 0, lexeme = ""; i < code.length; i++) {
            const ch = code[i];
            if (isStringChar(ch)) {
                const chars = [];
                for (i++; isInFile(i); i++) {
                    if (isStringChar(code[i])) {
                        if (isStringChar(code[i + 1])) {
                            chars.push('"');
                            i++;
                            continue;
                        }
                        break;
                    }
                    chars.push(code[i]);
                }
                output.push("(", "string", chars.join(""), ")");
                continue;
            }
            if (this.isLineComment(ch)) {
                do {
                    i++;
                } while (isInFile(i) && isInLine(i));
                continue;
            }
            if (isOpenRangeComment(i)) {
                do {
                    i++;
                } while (!isCloseRangeComment(i));
                continue;
            }
            if (this.isWhiteSpace(ch)) {
                pushLexeme(lexeme);
                lexeme = "";
                continue;
            }
            if (this.isDelimiter(ch)) {
                pushLexeme(lexeme);
                lexeme = "";
                output.push(ch);
                continue;
            }
            lexeme += ch;
            if (i === code.length - 1) {
                pushLexeme(lexeme);
                lexeme = "";
            }
        }
        return output;
    }
    expandSymbolAbbreviation(input, abbrevChar, fullForm) {
        const output = [];
        for (let i = 0; i < input.length; i++) {
            const curr = input[i];
            const next = input[i + 1];
            if (curr === abbrevChar && !this.isOpenParen(next) && next !== abbrevChar) {
                output.push("(", fullForm, next, ")");
                i++;
            }
            else {
                output.push(curr);
            }
        }
        return output;
    }
    expandListAbbreviation(input, abbrevChar, fullForm) {
        const output = [];
        for (let i = 0, paren = 0, flag = false; i < input.length; i++) {
            const curr = input[i];
            const next = input[i + 1];
            if (!flag && curr === abbrevChar && this.isOpenParen(next)) {
                output.push("(", fullForm);
                flag = true;
                continue;
            }
            output.push(curr);
            if (flag && this.isOpenParen(curr)) {
                paren++;
            }
            if (flag && this.isCloseParen(curr)) {
                paren--;
            }
            if (flag && paren === 0) {
                output.push(")");
                flag = false;
            }
        }
        return output.length > input.length
            ? this.expandListAbbreviation(output, abbrevChar, fullForm)
            : output;
    }
    expandPipeLeft(input, pipeSymbol) {
        const output = [];
        for (let i = 0, paren = 0, pipes = 0; i < input.length; i++) {
            const curr = input[i];
            if (curr === pipeSymbol) {
                output.push("(");
                pipes++;
                continue;
            }
            output.push(curr);
            if (pipes > 0 && this.isOpenParen(curr)) {
                paren++;
            }
            if (pipes > 0 && paren === 0 && this.isCloseParen(curr)) {
                for (; pipes > 0; pipes--) {
                    output.push(")");
                }
            }
            if (pipes > 0 && this.isCloseParen(curr)) {
                paren--;
            }
        }
        return output;
    }
    nest(input) {
        let i = -1;
        function pass(list) {
            if (++i === input.length) {
                return list;
            }
            const curr = input[i];
            const prev = input[i - 1];
            if (["{", "[", "("].includes(curr) && prev !== "string") {
                return list.concat([pass([])]).concat(pass([]));
            }
            if ([")", "]", "}"].includes(curr)) {
                if (prev === "string" && input[i - 2] !== "(" || prev !== "string") {
                    return list;
                }
            }
            return pass(list.concat(curr));
        }
        return pass([]);
    }
}
if (typeof module === "object") {
    module.exports.Parser = Parser;
}
class Printer {
    static stringify(input) {
        const texts = [];
        const isOpenParen = (c) => ["{", "[", "("].includes(c);
        const isQuoteAbbrev = (c) => c === "'";
        const lastChar = () => texts[texts.length - 1][texts[texts.length - 1].length - 1];
        const space = () => texts[texts.length - 1].length === 0 ||
            isOpenParen(lastChar()) ||
            isQuoteAbbrev(lastChar())
            ? ""
            : " ";
        function printClosure(closure) {
            texts.push("lambda (");
            loop(closure[1]);
            texts.push(")");
            loop(closure[2]);
        }
        function printQuote(obj) {
            if (Array.isArray(obj)) {
                texts.push(space() + "'(");
                loop(obj);
                texts.push(")");
            }
            else {
                texts.push(space() + "'" + obj);
            }
        }
        function loop(lst) {
            if (lst.length === 0) {
                return;
            }
            const element = lst[0];
            if (element === "closure") {
                printClosure(lst);
                return;
            }
            if (Array.isArray(element)) {
                if (element[0] === "string") {
                    texts.push(space() + '"' + element[1] + '"');
                }
                else if (element[0] === "quote") {
                    printQuote(element[1]);
                }
                else {
                    texts.push(space() + "(");
                    loop(element);
                    texts.push(")");
                }
            }
            else {
                texts.push(space() + String(element));
            }
            loop(lst.slice(1));
        }
        const type = typeof input;
        if (input === null || type === "boolean" || type === "number") {
            return String(input);
        }
        if (type === "string") {
            return input;
        }
        if (Array.isArray(input)) {
            if (input.length === 0) {
                return "()";
            }
            texts.push("(");
            loop(input);
            texts.push(")");
            return texts.join("");
        }
        return JSON.stringify(input);
    }
}
if (typeof module === "object") {
    module.exports.Printer = Printer;
}
class Validator {
    static assertArrayIndex(name, arr, index) {
        if (arr.length === 0) {
            throw `Error: '${name}' index operation of an empty list`;
        }
        if (index < 0 || index >= arr.length) {
            throw `Error: '${name}' list index out of range. Given: ${index}, list length ${arr.length}`;
        }
    }
}
class CoreLib {
    constructor(interpreter) {
        this.methods = {
            "+": this.evalAdd,
            "-": this.evalSubtract,
            "*": this.evalMultiply,
            "/": this.evalDivide,
            "%": this.evalModulo,
            "=": this.evalEqual,
            "!=": this.evalNotEqual,
            ">": this.evalGreater,
            ">=": this.evalGreaterOrEqual,
            "<": this.evalLower,
            "<=": this.evalLowerOrEqual,
            "~": this.evalAddStrings,
            "equal": this.evalScalarEqual,
            "not": this.evalNot,
            "to-string": this.evalToString,
            "to-number": this.evalToNumber,
            "to-boolean": this.evalToBoolean,
        };
        this.builtinHash = {};
        this.inter = interpreter;
        this.builtinFunc = Object.keys(this.methods);
        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }
    libEvalExpr(expr, env) {
        return this.methods[expr[0]].call(this, expr, env);
    }
    evalAdd(expr, env) {
        if (expr.length === 1) {
            return 0;
        }
        if (expr.length === 2) {
            const [num] = this.inter.evalArgs(["number"], expr, env);
            return num;
        }
        if (expr.length === 3) {
            const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
            return num1 + num2;
        }
        let sum = 0;
        for (let i = 1; i < expr.length; i++) {
            const num = this.inter.evalExpr(expr[i], env);
            if (typeof num !== "number") {
                throw `Error: '+' requires a number. Given: ${num}`;
            }
            sum += num;
        }
        return sum;
    }
    evalSubtract(expr, env) {
        if (expr.length === 2) {
            const [num] = this.inter.evalArgs(["number"], expr, env);
            return -num;
        }
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
        return num1 - num2;
    }
    evalMultiply(expr, env) {
        if (expr.length === 1) {
            return 1;
        }
        if (expr.length === 2) {
            const [num] = this.inter.evalArgs(["number"], expr, env);
            return num;
        }
        if (expr.length === 3) {
            const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
            return num1 * num2;
        }
        let res = 1;
        for (let i = 1; i < expr.length; i++) {
            const num = this.inter.evalExpr(expr[i], env);
            if (typeof num !== "number") {
                throw `Error: '*' requires a number. Given: ${num}`;
            }
            res *= num;
        }
        return res;
    }
    evalDivide(expr, env) {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
        if (num2 === 0) {
            throw "Error: '/' division by zero.";
        }
        return num1 / num2;
    }
    evalModulo(expr, env) {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
        return num1 % num2;
    }
    evalEqual(expr, env) {
        if (expr.length === 3) {
            const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
            return num1 === num2;
        }
        if (expr.length > 3) {
            const first = this.inter.evalExpr(expr[1], env);
            if (!this.inter.assertType(first, "number")) {
                throw `Error: '=' requires number. Given: ${first}`;
            }
            for (let i = 1; i < expr.length; i++) {
                if (this.inter.evalExpr(expr[i], env) !== first) {
                    return false;
                }
            }
            return true;
        }
        throw "Error: '=' requires 2 or more arguments. Given: " + (expr.length - 1);
    }
    evalGreater(expr, env) {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
        return num1 > num2;
    }
    evalLower(expr, env) {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
        return num1 < num2;
    }
    evalNotEqual(expr, env) {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
        return num1 !== num2;
    }
    evalGreaterOrEqual(expr, env) {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
        return num1 >= num2;
    }
    evalLowerOrEqual(expr, env) {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
        return num1 <= num2;
    }
    evalAddStrings(expr, env) {
        let text = "";
        for (let i = 1; i < expr.length; i++) {
            text += Printer.stringify(this.inter.evalExpr(expr[i], env));
        }
        return text;
    }
    evalScalarEqual(expr, env) {
        if (expr.length === 3) {
            const [obj1, obj2] = this.inter.evalArgs(["scalar", "scalar"], expr, env);
            return obj1 === obj2;
        }
        if (expr.length > 3) {
            const first = this.inter.evalExpr(expr[1], env);
            if (!this.inter.assertType(first, "scalar")) {
                throw `Error: 'equal' requires a scalar value. Given: ${first}`;
            }
            for (let i = 1; i < expr.length; i++) {
                if (this.inter.evalExpr(expr[i], env) !== first) {
                    return false;
                }
            }
            return true;
        }
        throw "Error: '=' requires 2 or more arguments. Given: " + (expr.length - 1);
    }
    evalNot(expr, env) {
        const [obj] = this.inter.evalArgs(["any"], expr, env);
        return !obj;
    }
    evalToBoolean(expr, env) {
        const [obj] = this.inter.evalArgs(["any"], expr, env);
        return Boolean(obj);
    }
    evalToNumber(expr, env) {
        const [obj] = this.inter.evalArgs(["any"], expr, env);
        const number = Number(obj);
        return isNaN(number) ? null : number;
    }
    evalToString(expr, env) {
        const [obj] = this.inter.evalArgs(["any"], expr, env);
        return Printer.stringify(obj);
    }
}
class DateLib {
    constructor(interpreter) {
        this.methods = {
            "date-now": this.evalDateNow,
            "date-to-string": this.evalDateToString,
        };
        this.builtinHash = {};
        this.inter = interpreter;
        this.builtinFunc = Object.keys(this.methods);
        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }
    libEvalExpr(expr, env) {
        return this.methods[expr[0]].call(this, expr, env);
    }
    evalDateNow(expr, env) {
        this.inter.evalArgs([], expr, env);
        return Date.now();
    }
    evalDateToString(expr, env) {
        const [date] = this.inter.evalArgs(["number"], expr, env);
        return new Date(date).toString();
    }
}
class ExtLib {
    constructor(interpreter) {
        this.builtinFunc = [];
        this.builtinHash = {};
        this.inter = interpreter;
        for (const funcName of Object.keys(this.inter.options.extFunctions)) {
            this.builtinFunc.push(funcName);
            this.builtinHash[funcName] = true;
        }
    }
    libEvalExpr(expr, env) {
        const funcName = expr[0];
        const argsList = this.inter.mapExprList(expr.slice(1), env);
        return this.inter.options.extFunctions[funcName].apply(this.inter.options.extContext, argsList);
    }
}
class ListLib {
    constructor(interpreter) {
        this.methods = {
            "list": this.list,
            "list-make": this.listMake,
            "list-range": this.listRange,
            "list-concat": this.listConcat,
            "list-flat": this.listFlat,
            "list-get": this.listGet,
            "list-has": this.listHas,
            "list-index-of": this.listIndex,
            "list-join": this.listJoin,
            "list-length": this.listLength,
            "list-pop": this.listPop,
            "list-push": this.listPush,
            "list-reverse": this.listReverse,
            "list-set": this.listSet,
            "list-shift": this.listShift,
            "list-slice": this.listSlice,
            "list-sort": this.listSort,
            "list-splice": this.listSplice,
            "list-unshift": this.listUnshift,
        };
        this.builtinHash = {};
        this.inter = interpreter;
        this.builtinFunc = Object.keys(this.methods);
        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }
    libEvalExpr(expr, env) {
        return this.methods[expr[0]].call(this, expr, env);
    }
    list(expr, env) {
        return this.inter.mapExprList(expr.slice(1), env);
    }
    listMake(expr, env) {
        const [size, fill] = this.inter.evalArgs(["number", ["any", 0]], expr, env);
        return [...Array(size).keys()].map(() => fill);
    }
    listRange(expr, env) {
        const [size, from] = this.inter.evalArgs(["number", ["number", 0]], expr, env);
        return [...Array(size).keys()].map((e) => e + from);
    }
    listConcat(expr, env) {
        const [lst1, lst2] = this.inter.evalArgs(["array", "array"], expr, env);
        return lst1.concat(lst2);
    }
    listFlat(expr, env) {
        const [lst, depth] = this.inter.evalArgs(["array", ["number", 1]], expr, env);
        return lst.flat(depth);
    }
    listGet(expr, env) {
        const [lst, index] = this.inter.evalArgs(["array", "number"], expr, env);
        Validator.assertArrayIndex("list-get", lst, index);
        return lst[index];
    }
    listHas(expr, env) {
        const [lst, elem] = this.inter.evalArgs(["array", "scalar"], expr, env);
        return lst.includes(elem);
    }
    listIndex(expr, env) {
        const [lst, elem] = this.inter.evalArgs(["array", "scalar"], expr, env);
        return lst.indexOf(elem);
    }
    listJoin(expr, env) {
        const [lst, sep] = this.inter.evalArgs(["array", ["string", ","]], expr, env);
        return lst.join(sep);
    }
    listPop(expr, env) {
        const [lst] = this.inter.evalArgs(["array"], expr, env);
        return lst.pop();
    }
    listLength(expr, env) {
        const [lst] = this.inter.evalArgs(["array"], expr, env);
        return lst.length;
    }
    listPush(expr, env) {
        const [lst, elem] = this.inter.evalArgs(["array", "any"], expr, env);
        return lst.push(elem);
    }
    listReverse(expr, env) {
        const [lst] = this.inter.evalArgs(["array"], expr, env);
        return lst.reverse();
    }
    listSet(expr, env) {
        const [lst, index, elem] = this.inter.evalArgs(["array", "number", "any"], expr, env);
        Validator.assertArrayIndex("list-set", lst, index);
        return lst[index] = elem;
    }
    listShift(expr, env) {
        const [lst] = this.inter.evalArgs(["array"], expr, env);
        return lst.shift();
    }
    listSlice(expr, env) {
        const [lst, start, end] = this.inter.evalArgs(["array", ["number", 0], ["number", 0]], expr, env);
        return lst.slice(start, end || lst.length);
    }
    listSort(expr, env) {
        const [lst] = this.inter.evalArgs(["array"], expr, env);
        return lst.sort();
    }
    listSplice(expr, env) {
        const [lst, start, count] = this.inter.evalArgs(["array", "number", ["number", 1]], expr, env);
        Validator.assertArrayIndex("list-splice", lst, start);
        return lst.splice(start, count);
    }
    listUnshift(expr, env) {
        const [lst, elem] = this.inter.evalArgs(["array", "any"], expr, env);
        return lst.unshift(elem);
    }
}
class MathLib {
    constructor(interpreter) {
        this.methods = {
            "math-pi": this.evalMathPi,
            "math-abs": this.evalMathAbs,
            "math-ceil": this.evalMathCeil,
            "math-floor": this.evalMathFloor,
            "math-log": this.evalMathLog,
            "math-max": this.evalMathMax,
            "math-min": this.evalMathMin,
            "math-pow": this.evalMathPow,
            "math-random": this.evalMathRandom,
            "math-round": this.evalMathRound,
            "math-sqrt": this.evalMathSqrt,
        };
        this.builtinHash = {};
        this.inter = interpreter;
        this.builtinFunc = Object.keys(this.methods);
        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }
    libEvalExpr(expr, env) {
        return this.methods[expr[0]].call(this, expr, env);
    }
    evalMathPi(expr, env) {
        this.inter.evalArgs([], expr, env);
        return Math.PI;
    }
    evalMathAbs(expr, env) {
        const [num] = this.inter.evalArgs(["number"], expr, env);
        return Math.abs(num);
    }
    evalMathCeil(expr, env) {
        const [num] = this.inter.evalArgs(["number"], expr, env);
        return Math.ceil(num);
    }
    evalMathFloor(expr, env) {
        const [num] = this.inter.evalArgs(["number"], expr, env);
        return Math.floor(num);
    }
    evalMathLog(expr, env) {
        const [num] = this.inter.evalArgs(["number"], expr, env);
        return Math.log(num);
    }
    evalMathMax(expr, env) {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
        return Math.max(num1, num2);
    }
    evalMathMin(expr, env) {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
        return Math.min(num1, num2);
    }
    evalMathPow(expr, env) {
        const [num1, num2] = this.inter.evalArgs(["number", "number"], expr, env);
        return Math.pow(num1, num2);
    }
    evalMathRandom(expr, env) {
        this.inter.evalArgs([], expr, env);
        return Math.random();
    }
    evalMathRound(expr, env) {
        const [num] = this.inter.evalArgs(["number"], expr, env);
        return Math.round(num);
    }
    evalMathSqrt(expr, env) {
        const [num] = this.inter.evalArgs(["number"], expr, env);
        return Math.sqrt(num);
    }
}
class NumberLib {
    constructor(interpreter) {
        this.methods = {
            "number-max-int": this.evalMaxInt,
            "number-min-int": this.evalMinInt,
            "number-parse-float": this.evalParseFloat,
            "number-parse-int": this.evalParseInt,
            "number-is-finite": this.evalIsFinite,
            "number-is-integer": this.evalIsInteger,
            "number-to-fixed": this.evalToFixed,
            "number-to-string": this.evalToString,
        };
        this.builtinHash = {};
        this.inter = interpreter;
        this.builtinFunc = Object.keys(this.methods);
        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }
    libEvalExpr(expr, env) {
        return this.methods[expr[0]].call(this, expr, env);
    }
    evalMaxInt(expr, env) {
        this.inter.evalArgs([], expr, env);
        return Number.MAX_SAFE_INTEGER;
    }
    evalMinInt(expr, env) {
        this.inter.evalArgs([], expr, env);
        return Number.MIN_SAFE_INTEGER;
    }
    evalParseFloat(expr, env) {
        const [str] = this.inter.evalArgs(["string"], expr, env);
        const res = parseFloat(str);
        if (isNaN(res)) {
            throw "Error: 'number-parse-float' argument not a number: " + str;
        }
        return res;
    }
    evalParseInt(expr, env) {
        const [str] = this.inter.evalArgs(["string"], expr, env);
        const res = parseInt(str);
        if (isNaN(res)) {
            throw "Error: 'number-parse-int' argument not a number: " + str;
        }
        return res;
    }
    evalIsFinite(expr, env) {
        const [num] = this.inter.evalArgs(["number"], expr, env);
        return isFinite(num);
    }
    evalIsInteger(expr, env) {
        const [num] = this.inter.evalArgs(["number"], expr, env);
        return isFinite(num) && Math.floor(num) === num;
    }
    evalToFixed(expr, env) {
        const [num, digits] = this.inter.evalArgs(["number", ["number", 0]], expr, env);
        return num.toFixed(digits);
    }
    evalToString(expr, env) {
        const [num] = this.inter.evalArgs(["number"], expr, env);
        return num.toString();
    }
}
class StringLib {
    constructor(interpreter) {
        this.methods = {
            "string-char-at": this.strCharAt,
            "string-char-code-at": this.strCharCodeAt,
            "string-concat": this.strConcat,
            "string-ends-with": this.strEndsWith,
            "string-from-char-code": this.strFromCharCode,
            "string-includes": this.strIncludes,
            "string-index-of": this.strIndexOf,
            "string-last-index-of": this.strLastIndexOf,
            "string-length": this.strLength,
            "string-match": this.strMatch,
            "string-repeat": this.strRepeat,
            "string-replace": this.strReplace,
            "string-split": this.strSplit,
            "string-starts-with": this.strStartsWith,
            "string-sub-string": this.strSubString,
            "string-trim": this.strTrim,
            "string-trim-left": this.strTrimLeft,
            "string-trim-right": this.strTrimRight,
            "string-to-lower": this.strToLower,
            "string-to-upper": this.strToUpper,
        };
        this.builtinHash = {};
        this.inter = interpreter;
        this.builtinFunc = Object.keys(this.methods);
        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }
    libEvalExpr(expr, env) {
        return this.methods[expr[0]].call(this, expr, env);
    }
    strCharAt(expr, env) {
        const [str, pos] = this.inter.evalArgs(["string", "number"], expr, env);
        return str.charAt(pos);
    }
    strCharCodeAt(expr, env) {
        const [str, index] = this.inter.evalArgs(["string", "number"], expr, env);
        const code = str.charCodeAt(index);
        if (isNaN(code)) {
            throw `Error: 'string-char-code-at' index out of range.`;
        }
        return code;
    }
    strConcat(expr, env) {
        return this.inter.mapExprList(expr.slice(1), env)
            .map(Printer.stringify)
            .reduce((acc, e) => acc + e);
    }
    strEndsWith(expr, env) {
        const [str, search] = this.inter.evalArgs(["string", "string"], expr, env);
        return str.endsWith(search);
    }
    strFromCharCode(expr, env) {
        const [code] = this.inter.evalArgs(["number"], expr, env);
        return String.fromCharCode(code);
    }
    strIncludes(expr, env) {
        const [str, search, pos] = this.inter.evalArgs(["string", "string", ["number", 0]], expr, env);
        return str.includes(search, pos);
    }
    strIndexOf(expr, env) {
        const [str, search, pos] = this.inter.evalArgs(["string", "string", ["number", 0]], expr, env);
        return str.indexOf(search, pos);
    }
    strLastIndexOf(expr, env) {
        const [str, search, pos] = this.inter.evalArgs(["string", "string", ["number", 0]], expr, env);
        return str.lastIndexOf(search, pos);
    }
    strLength(expr, env) {
        const [str] = this.inter.evalArgs(["string"], expr, env);
        return str.length;
    }
    strMatch(expr, env) {
        const [str, pattern, flags] = this.inter.evalArgs(["string", "string", ["string", ""]], expr, env);
        const regExp = new RegExp(pattern, flags);
        return str.match(regExp);
    }
    strRepeat(expr, env) {
        const [str, count] = this.inter.evalArgs(["string", "number"], expr, env);
        return str.repeat(count);
    }
    strReplace(expr, env) {
        const [str, pattern, replace, flags] = this.inter.evalArgs(["string", "string", "string", ["string", ""]], expr, env);
        const regExp = new RegExp(pattern, flags);
        return str.replace(regExp, replace);
    }
    strSplit(expr, env) {
        const [str, sep] = this.inter.evalArgs(["string", ["string", ""]], expr, env);
        return str.split(sep);
    }
    strStartsWith(expr, env) {
        const [str, search] = this.inter.evalArgs(["string", "string"], expr, env);
        return str.startsWith(search);
    }
    strSubString(expr, env) {
        const [str, start, end] = this.inter.evalArgs(["string", "number", ["number", 0]], expr, env);
        return str.substring(start, end);
    }
    strTrim(expr, env) {
        const [str] = this.inter.evalArgs(["string"], expr, env);
        return str.trim();
    }
    strTrimLeft(expr, env) {
        const [str] = this.inter.evalArgs(["string"], expr, env);
        return str.trimLeft();
    }
    strTrimRight(expr, env) {
        const [str] = this.inter.evalArgs(["string"], expr, env);
        return str.trimRight();
    }
    strToLower(expr, env) {
        const [str] = this.inter.evalArgs(["string"], expr, env);
        return str.toLowerCase();
    }
    strToUpper(expr, env) {
        const [str] = this.inter.evalArgs(["string"], expr, env);
        return str.toUpperCase();
    }
}
