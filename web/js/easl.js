"use strict";
class Easl {
    constructor() {
        this.interpreter = new Interpreter();
    }
    evaluate(codeText, optionsParam, callback) {
        const options = optionsParam
            ? Options.parse(optionsParam)
            : new Options();
        try {
            const codeTree = Parser.parse(codeText);
            const output = this.interpreter.evalCodeTree(codeTree, options, callback);
            return output;
        }
        catch (e) {
            if (typeof callback === "function") {
                callback(String(e));
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
        this.isDebug = false;
        this.libs = [];
        this.options = new Options();
    }
    evalCodeTree(codeTree, options, callback) {
        this.options = options;
        this.libs.push(...LibManager.getBuiltinLibs(options.libs, this));
        if (typeof callback === "function") {
            this.manageImports(codeTree, this.manageImport_ready.bind(this, callback));
        }
        else {
            return this.evalExprLst(codeTree, []);
        }
    }
    manageImport_ready(callback, codeTree) {
        const res = this.evalExprLst(codeTree, []);
        callback(res);
    }
    evalExprLst(exprLst, env) {
        let res;
        for (const expr of exprLst) {
            res = this.evalExpr(expr, env);
        }
        return res;
    }
    mapExprLst(exprLst, env) {
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
            case "break": return "break";
            case "continue": return "continue";
        }
        switch (typeof expr) {
            case "number": return expr;
            case "string": return this.lookup(expr, env);
            case "boolean": return expr;
        }
        if (this.isDebug) {
            this.dumpState(expr, env);
        }
        switch (expr[0]) {
            case "list": return this.mapExprLst(expr.slice(1), env);
            case "string": return expr[1];
            case "let": return this.evalLet(expr, env);
            case "set!": return this.evalSet(expr, env);
            case "lambda": return this.evalLambda(expr, env);
            case "function": return this.evalFunction(expr, env);
            case "block": return this.evalBlock(expr, env);
            case "if": return this.evalIf(expr, env);
            case "cond": return this.evalCond(expr, env);
            case "case": return this.evalCase(expr, env);
            case "for": return this.evalFor(expr, env);
            case "while": return this.evalWhile(expr, env);
            case "do": return this.evalDo(expr, env);
            case "debug": return this.evalDebug();
        }
        const res = this.resolveThroughLib(expr, env);
        if (res.resolved)
            return res.val;
        return this.callProc(expr, env);
    }
    isTruthy(value) {
        return !this.isFaulty(value);
    }
    isFaulty(value) {
        if (Array.isArray(value) && value.length === 0)
            return true;
        return !value;
    }
    lookup(symbol, env) {
        for (const cell of env) {
            if (symbol === cell[0]) {
                return cell[1];
            }
        }
        throw Error(`Unbound identifier: ${symbol}`);
    }
    throwOnExistingDef(symbol, env) {
        for (const cell of env) {
            if (symbol === cell[0]) {
            }
        }
    }
    setInEnv(symbol, value, env) {
        for (const cell of env) {
            if (symbol === cell[0]) {
                cell[1] = value;
                return;
            }
        }
        throw Error(`Unbound identifier: ${symbol}`);
    }
    callProc(expr, env) {
        const proc = expr[0];
        const isNamed = typeof proc === "string";
        const closure = isNamed ? this.lookup(proc, env) : this.evalExpr(proc, env);
        if (!Array.isArray(closure)) {
            throw Error(`Improper function: ${closure}`);
        }
        const args = expr.length === 1
            ? []
            : expr.length === 2
                ? [this.evalExpr(expr[1], env)]
                : this.mapExprLst(expr.slice(1), env);
        const funcName = isNamed ? proc : "lambda";
        const params = closure[1];
        const closureBody = closure[2].length === 1 ? closure[2][0] : closure[2];
        const closureEnv = this.assocArgsToParams(params, args)
            .concat([["func-name", funcName], ["func-params", params], ["func-args", args]])
            .concat(env).concat(closure[3]);
        if (closureBody === "block") {
            throw Error(`Improper function: ${funcName}`);
        }
        if (closureBody.length === 0) {
            throw Error(`Function with empty body: ${funcName}`);
        }
        return this.evalExpr(closureBody, closureEnv);
    }
    assocArgsToParams(params, args) {
        const aList = [];
        for (let i = 0; i < params.length; i++) {
            const arg = i < args.length ? args[i] : null;
            aList.push([params[i], arg]);
        }
        return aList;
    }
    evalLambda(expr, env) {
        return ["closure", expr[1], expr[2], env.slice()];
    }
    evalLet(expr, env) {
        const symbol = expr[1];
        this.throwOnExistingDef(symbol, env);
        const value = this.evalLetValue(expr, env);
        env.unshift([symbol, value]);
        return value;
    }
    evalSet(expr, env) {
        const symbol = expr[1];
        const value = this.evalLetValue(expr, env);
        this.setInEnv(symbol, value, env);
        return value;
    }
    evalBlock(expr, env) {
        if (expr.length === 1) {
            throw Error(`Empty body`);
        }
        return this.evalExprLst(expr.slice(1), env);
    }
    evalLetValue(expr, env) {
        const letExpr = expr[2];
        const value = (Array.isArray(letExpr) && letExpr[0] === "lambda")
            ? this.evalLambda(["lambda", letExpr[1], letExpr[2]], env)
            : this.evalExpr(letExpr, env);
        return value;
    }
    evalFunction(expr, env) {
        const symbol = expr[1];
        this.throwOnExistingDef(symbol, env);
        const body = expr.length === 4 ? [expr[3]] : ["block", ...expr.slice(3)];
        const value = this.evalLambda(["lambda", expr[2], body], env);
        env.unshift([expr[1], value]);
        return symbol;
    }
    evalIf(expr, env) {
        return this.isTruthy(this.evalExpr(expr[1], env))
            ? this.evalExpr(expr[2], env)
            : expr.length === 4
                ? this.evalExpr(expr[3], env)
                : null;
    }
    evalCond(expr, env) {
        const clauses = expr.slice(1);
        for (const clause of clauses) {
            if (clause[0] === "else") {
                return this.evalExprLst(clause.slice(1), env);
            }
            if (this.evalExpr(clause[0], env)) {
                return this.evalExprLst(clause.slice(1), env);
            }
        }
        return null;
    }
    evalCase(expr, env) {
        const val = this.evalExpr(expr[1], env);
        const clauses = expr.slice(2);
        for (const clause of clauses) {
            if (clause[0] === "else") {
                return this.evalExprLst(clause.slice(1), env);
            }
            if (clause[0].indexOf(val) > -1) {
                return this.evalExprLst(clause.slice(1), env);
            }
        }
        return null;
    }
    evalFor(expr, env) {
        const condBody = expr[2];
        const incBody = expr[3];
        const loopBody = expr.slice(4);
        const loopEnv = env;
        const cntId = expr[1][0];
        const cntPair = [cntId, this.evalExpr(expr[1][1], loopEnv)];
        loopEnv.unshift(cntPair);
        const setEnv = () => {
            for (const cell of loopEnv) {
                if (cell[0] === cntId) {
                    cell[1] = cntPair[1];
                    break;
                }
            }
        };
        for (; this.evalExpr(condBody, loopEnv); cntPair[1] = this.evalExpr(incBody, loopEnv)) {
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, loopEnv);
                if (res === "continue")
                    break;
                if (res === "break")
                    return null;
            }
            setEnv();
        }
        return null;
    }
    evalWhile(expr, env) {
        const condBody = expr[1];
        const loopBody = expr.slice(2);
        while (this.evalExpr(condBody, env)) {
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue")
                    break;
                if (res === "break")
                    return null;
            }
        }
        return null;
    }
    evalDo(expr, env) {
        const condBody = expr[expr.length - 1];
        const loopBody = expr.slice(1, expr.length - 1);
        do {
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue")
                    break;
                if (res === "break")
                    return null;
            }
        } while (this.evalExpr(condBody, env));
        return null;
    }
    evalDebug() {
        this.isDebug = true;
        return null;
    }
    dumpState(expr, env) {
        const envDumpList = [];
        for (const e of env) {
            envDumpList.push(`${e[0]} : ${JSON.stringify(e[1])}`);
        }
        const envDumpText = envDumpList.join("\n      ");
        const message = `Expr: ${JSON.stringify(expr)}\nEnv : ${envDumpText}`;
        this.options.printer(message);
        this.isDebug = false;
        return null;
    }
    manageImports(codeTree, callback) {
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
    resolveThroughLib(expr, env) {
        for (const lib of this.libs) {
            const res = lib.libEvalExpr(expr, env);
            if (res !== "##not-resolved##")
                return { resolved: true, val: res };
        }
        return { resolved: false, val: null };
    }
}
class LibManager {
    static getBuiltinLibs(libList, inter) {
        return libList.map(lib => LibManager.createLib(lib, inter));
    }
    static createLib(libName, inter) {
        switch (libName) {
            case "core-lib":
                return new CoreLib(inter);
            case "date-lib":
                return new DateLib(inter);
            case "list-lib":
                return new ListLib(inter);
            case "math-lib":
                return new MathLib(inter);
            case "number-lib":
                return new NumberLib(inter);
            case "string-lib":
                return new StringLib(inter);
            default:
                throw Error("Unknown lib: " + libName);
        }
    }
    static importLibrary(libUrl, callback) {
        if (typeof libUrl !== "string" || libUrl.length === 0) {
            throw Error("Empty library name");
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
                throw Error("Cannot load library content: " + libName);
            }
            const libCode = Parser.parse(libText);
            IoService.setItemToLocalStorage(libUrl, libCode);
            callback(libCode);
        }
    }
}
class Options {
    constructor() {
        this.printer = console.log;
        this.libs = ["core-lib", "date-lib", "list-lib", "math-lib", "number-lib", "string-lib"];
    }
    static parse(options) {
        const evalOptions = new Options();
        if (typeof options.print === "function") {
            evalOptions.printer = options.printer;
        }
        if (Array.isArray(options.libs)) {
            evalOptions.libs = options.libs.slice();
        }
        return evalOptions;
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
            throw Error("Error while getting: " + url + ", " + e.message);
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
            throw Error("Set item to local storage: " + key + ", " + e.message);
        }
    }
    static getItemFromLocalStorage(key) {
        try {
            const value = localStorageLib.getItem(key);
            return value && JSON.parse(value);
        }
        catch (e) {
            throw Error("Get item to local storage: " + key + ", " + e.message);
        }
    }
}
class CoreLib {
    constructor(interpreter) {
        this.inter = interpreter;
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "+": return this.evalPlus(expr, env);
            case "-": return this.evalSubtract(expr, env);
            case "*": return this.evalMultiply(expr, env);
            case "/": return this.evalDivide(expr, env);
            case "%": return this.evalModulo(expr, env);
            case "=": return this.evalEqual(expr, env);
            case ">": return this.inter.evalExpr(expr[1], env) > this.inter.evalExpr(expr[2], env);
            case "<": return this.inter.evalExpr(expr[1], env) < this.inter.evalExpr(expr[2], env);
            case "!=": return this.inter.evalExpr(expr[1], env) !== this.inter.evalExpr(expr[2], env);
            case ">=": return this.inter.evalExpr(expr[1], env) >= this.inter.evalExpr(expr[2], env);
            case "<=": return this.inter.evalExpr(expr[1], env) <= this.inter.evalExpr(expr[2], env);
            case "and": return this.evalAnd(expr, env);
            case "or": return this.evalOr(expr, env);
            case "not": return this.evalNot(this.inter.evalExpr(expr[1], env));
            case "type-of": return this.evalTypeOf(expr, env);
            case "to-string": return this.evalToString(expr, env);
            case "to-number": return this.evalToNumber(expr, env);
            case "to-boolean": return this.evalToBoolean(expr, env);
            case "parse": return this.evalParse(expr, env);
            case "eval": return this.evalEval(expr, env);
            case "print": return this.evalPrint(expr, env);
        }
        return "##not-resolved##";
    }
    evalPlus(expr, env) {
        if (expr.length === 1) {
            return 0;
        }
        else if (expr.length === 2) {
            return this.inter.evalExpr(expr[1], env);
        }
        else if (expr.length === 3) {
            return this.inter.evalExpr(expr[1], env) + this.inter.evalExpr(expr[2], env);
        }
        else {
            return this.inter.evalExpr(expr[1], env) + this.evalPlus(expr.slice(1), env);
        }
    }
    evalSubtract(expr, env) {
        if (expr.length === 1) {
            throw Error("Wrong number of arguments: " + "-");
        }
        else if (expr.length === 2) {
            return -this.inter.evalExpr(expr[1], env);
        }
        else if (expr.length === 3) {
            return this.inter.evalExpr(expr[1], env) - this.inter.evalExpr(expr[2], env);
        }
        else {
            return this.inter.evalExpr(expr[1], env) - this.evalPlus(expr.slice(1), env);
        }
    }
    evalMultiply(expr, env) {
        if (expr.length === 1) {
            return 1;
        }
        else if (expr.length === 2) {
            return this.inter.evalExpr(expr[1], env);
        }
        else if (expr.length === 3) {
            return this.inter.evalExpr(expr[1], env) * this.inter.evalExpr(expr[2], env);
        }
        else {
            return this.inter.evalExpr(expr[1], env) * this.evalMultiply(expr.slice(1), env);
        }
    }
    evalDivide(expr, env) {
        if (expr.length === 1) {
            throw Error("Wrong number of arguments: " + "/");
        }
        else if (expr.length === 2) {
            return 1 / this.inter.evalExpr(expr[1], env);
        }
        else if (expr.length === 3) {
            if (this.inter.evalExpr(expr[2], env) === 0) {
                throw Error("Division by zero");
            }
            return this.inter.evalExpr(expr[1], env) / this.inter.evalExpr(expr[2], env);
        }
        else {
            return this.inter.evalExpr(expr[1], env) / this.evalMultiply(expr.slice(1), env);
        }
    }
    evalModulo(expr, env) {
        if (expr.length === 3) {
            const n = this.inter.evalExpr(expr[1], env);
            const m = this.inter.evalExpr(expr[2], env);
            return n % m;
        }
        else {
            throw Error("Wrong number of arguments: " + "%");
        }
    }
    evalEqual(expr, env) {
        if (expr.length === 3) {
            return this.inter.evalExpr(expr[1], env) === this.inter.evalExpr(expr[2], env);
        }
        else if (expr.length > 3) {
            const first = this.inter.evalExpr(expr[1], env);
            for (let i = 2; i < expr.length; i++) {
                if (this.inter.evalExpr(expr[i], env) !== first)
                    return false;
            }
            return true;
        }
        else {
            throw Error("Wrong number of arguments: " + "=");
        }
    }
    evalAnd(expr, env) {
        if (expr.length === 1) {
            return true;
        }
        else if (expr.length === 2) {
            return this.inter.evalExpr(expr[1], env);
        }
        else if (expr.length === 3) {
            const val = this.inter.evalExpr(expr[1], env);
            return this.inter.isTruthy(val) ? this.inter.evalExpr(expr[2], env) : val;
        }
        else {
            const val = this.inter.evalExpr(expr[1], env);
            return this.inter.isTruthy(val) ? this.evalAnd(expr.slice(1), env) : val;
        }
    }
    evalOr(expr, env) {
        if (expr.length === 1) {
            return false;
        }
        else if (expr.length === 2) {
            return this.inter.evalExpr(expr[1], env);
        }
        else if (expr.length === 3) {
            const val = this.inter.evalExpr(expr[1], env);
            return this.inter.isTruthy(val) ? val : this.inter.evalExpr(expr[2], env);
        }
        else {
            const val = this.inter.evalExpr(expr[1], env);
            return this.inter.isTruthy(val) ? val : this.evalOr(expr.slice(1), env);
        }
    }
    evalNot(a) {
        return (Array.isArray(a) && a.length === 0) || !a;
    }
    evalTypeOf(expr, env) {
        if (expr.length === 1) {
            return "null";
        }
        const entity = expr[1];
        if (Array.isArray(entity)) {
            switch (entity[0]) {
                case "list": return "list";
                case "string": return "string";
                case "lambda":
                case "function":
                case "closure": return "function";
            }
        }
        if (entity === "null")
            return "null";
        const value = this.inter.evalExpr(entity, env);
        if (Array.isArray(value)) {
            switch (value[0]) {
                case "lambda":
                case "function":
                case "closure": return "function";
            }
        }
        return typeof value;
    }
    evalToBoolean(expr, env) {
        const entity = this.inter.evalExpr(expr[1], env);
        return !this.evalNot(entity);
    }
    evalToNumber(expr, env) {
        const entity = this.inter.evalExpr(expr[1], env);
        const number = Number(entity);
        return number !== number ? null : number;
    }
    evalToString(expr, env) {
        function bodyToString(body) {
            if (Array.isArray(body)) {
                if (body[0] === "block") {
                    return body.slice(1).join(" ");
                }
                return body.join(" ");
            }
            return String(body);
        }
        function getText(entity) {
            const type = typeof entity;
            if (entity === null) {
                return "null";
            }
            if (type === "string") {
                return entity;
            }
            if (type === "boolean" || type === "number") {
                return String(entity);
            }
            if (Array.isArray(entity)) {
                if (entity[0] === "closure") {
                    return "{lambda (" + entity[1].join(" ") + ") (" + bodyToString(entity[2]) + ")}";
                }
                else {
                    return entity.join(" ");
                }
            }
            return JSON.stringify(entity);
        }
        let text = "";
        if (expr.length === 2) {
            text = getText(this.inter.evalExpr(expr[1], env));
        }
        else if (expr.length > 2) {
            text = getText(this.inter.mapExprLst(expr.slice(1), env));
        }
        return text;
    }
    evalParse(expr, env) {
        const codeText = this.inter.evalExpr(expr[1], env);
        return Parser.parse(codeText);
    }
    evalEval(expr, env) {
        const codeTree = this.inter.evalExpr(expr[1], env);
        return this.inter.evalCodeTree(codeTree, this.inter.options);
    }
    evalPrint(expr, env) {
        const text = this.evalToString(expr, env);
        this.inter.options.printer(text);
        return null;
    }
}
class DateLib {
    constructor(interpreter) {
        this.inter = interpreter;
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "date.now": return Date.now();
            case "date.to-string": return (new Date(this.inter.evalExpr(expr[1], env))).toString();
        }
        return "##not-resolved##";
    }
}
class ListLib {
    constructor(interpreter) {
        this.inter = interpreter;
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "list.add": return this.listAdd(expr, env);
            case "list.add!": return this.listAdd(expr, env, false);
            case "list.append": return this.listAppend(expr, env);
            case "list.empty": return [];
            case "list.empty?": return this.listEmpty(expr, env);
            case "list.first": return this.listFirst(expr, env);
            case "list.flatten": return this.listFlatten(expr, env);
            case "list.get": return this.listGet(expr, env);
            case "list.has?": return this.listHas(expr, env);
            case "list.index": return this.listIndex(expr, env);
            case "list.join": return this.listJoin(expr, env);
            case "list.last": return this.listLast(expr, env);
            case "list.least": return this.listLeast(expr, env);
            case "list.length": return this.listLength(expr, env);
            case "list.list?": return this.listIsList(expr, env);
            case "list.push": return this.listPush(expr, env);
            case "list.push!": return this.listPush(expr, env, false);
            case "list.range": return this.listRange(expr, env);
            case "list.rest": return this.listRest(expr, env);
            case "list.set": return this.listSet(expr, env);
            case "list.set!": return this.listSet(expr, env, false);
            case "list.slice": return this.listSlice(expr, env);
        }
        return "##not-resolved##";
    }
    listAdd(expr, env, pure = true) {
        const elm = this.inter.evalExpr(expr[1], env);
        const lst = this.inter.evalExpr(expr[2], env);
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
    listAppend(expr, env) {
        const lst1 = this.inter.evalExpr(expr[1], env);
        const lst2 = this.inter.evalExpr(expr[2], env);
        return Array.isArray(lst2) ? lst2.concat(lst1) : lst1;
    }
    listEmpty(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) ? lst.length === 0 : true;
    }
    listFirst(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 0 ? lst[0] : null;
    }
    listFlatten(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return this.listFlattenLoop(lst);
    }
    listFlattenLoop(arr) {
        return arr.reduce((flat, toFlatten) => flat.concat(Array.isArray(toFlatten)
            ? this.listFlattenLoop(toFlatten)
            : toFlatten), []);
    }
    listGet(expr, env) {
        const index = this.inter.evalExpr(expr[1], env);
        const lst = this.inter.evalExpr(expr[2], env);
        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            return lst[index];
        }
        return null;
    }
    listHas(expr, env) {
        return this.listIndex(expr, env) > -1;
    }
    listIndex(expr, env) {
        const elm = this.inter.evalExpr(expr[1], env);
        const lst = this.inter.evalExpr(expr[2], env);
        if (Array.isArray(lst)) {
            return lst.indexOf(elm);
        }
        return -1;
    }
    listIsList(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst);
    }
    listJoin(expr, env) {
        const sep = expr[1];
        const lst = this.inter.evalExpr(expr[2], env);
        return lst.join(sep);
    }
    listLast(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 0 ? lst[lst.length - 1] : null;
    }
    listLeast(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 1 ? lst.slice(0, lst.length - 1) : [];
    }
    listLength(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) ? lst.length : -1;
    }
    listPush(expr, env, pure = true) {
        const elm = this.inter.evalExpr(expr[1], env);
        const lst = this.inter.evalExpr(expr[2], env);
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
    listRange(expr, env) {
        const start = this.inter.evalExpr(expr[1], env);
        const end = this.inter.evalExpr(expr[2], env);
        if (start >= end)
            return [];
        const res = [];
        for (let i = start; i <= end; i++) {
            res.push(i);
        }
        return res;
    }
    listRest(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 1 ? lst.slice(1) : [];
    }
    listSet(expr, env, pure = true) {
        const elm = this.inter.evalExpr(expr[1], env);
        const index = this.inter.evalExpr(expr[2], env);
        const lst = this.inter.evalExpr(expr[3], env);
        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            const list = pure ? lst.slice() : lst;
            list[index] = elm;
            return list;
        }
        return lst;
    }
    listSlice(expr, env) {
        const from = this.inter.evalExpr(expr[1], env);
        const to = this.inter.evalExpr(expr[2], env);
        const lst = this.inter.evalExpr(expr[3], env);
        return lst.slice(from, to);
    }
}
class MathLib {
    constructor(interpreter) {
        this.inter = interpreter;
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "math.pi": return Math.PI;
            case "math.abs": return Math.abs(this.inter.evalExpr(expr[1], env));
            case "math.ceil": return Math.ceil(this.inter.evalExpr(expr[1], env));
            case "math.floor": return Math.floor(this.inter.evalExpr(expr[1], env));
            case "math.log": return Math.log(this.inter.evalExpr(expr[1], env)) * Math.LOG10E;
            case "math.ln": return Math.log(this.inter.evalExpr(expr[1], env));
            case "math.max": return Math.max(this.inter.evalExpr(expr[1], env), this.inter.evalExpr(expr[2], env));
            case "math.min": return Math.min(this.inter.evalExpr(expr[1], env), this.inter.evalExpr(expr[2], env));
            case "math.pow": return Math.pow(this.inter.evalExpr(expr[1], env), this.inter.evalExpr(expr[2], env));
            case "math.random": return Math.random();
            case "math.round": return Math.round(this.inter.evalExpr(expr[1], env));
            case "math.sqrt": return Math.sqrt(this.inter.evalExpr(expr[1], env));
        }
        return "##not-resolved##";
    }
}
class NumberLib {
    constructor(interpreter) {
        this.inter = interpreter;
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "numb.finite?": return this.evalIsFine(expr, env);
            case "numb.integer?": return this.evalIsInteger(expr, env);
            case "numb.max-value": return Number.MAX_VALUE;
            case "numb.min-value": return Number.MIN_VALUE;
            case "numb.parse-float": return this.evalParseFloat(expr, env);
            case "numb.parse-int": return this.evalParseInt(expr, env);
            case "numb.to-fixed": return this.evalToFixed(expr, env);
            case "numb.to-precision": return this.evalToPrecision(expr, env);
            case "numb.to-string": return this.evalToString(expr, env);
        }
        return "##not-resolved##";
    }
    evalIsFine(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        return typeof value === "number" && isFinite(value);
    }
    evalIsInteger(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        return typeof typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    }
    evalParseFloat(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        return parseFloat(value);
    }
    evalParseInt(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        return parseInt(value);
    }
    evalToFixed(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        const digits = expr[2] ? this.inter.evalExpr(expr[2], env) : 0;
        return value.toFixed(digits);
    }
    evalToPrecision(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        const precision = expr[2] ? this.inter.evalExpr(expr[2], env) : 0;
        return value.toPrecision(precision);
    }
    evalToString(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        const radix = expr[2] ? this.inter.evalExpr(expr[2], env) : 10;
        return value.toString(radix);
    }
}
class StringLib {
    constructor(interpreter) {
        this.inter = interpreter;
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "str.length": return this.strLength(expr, env);
            case "str.has": return this.strHas(expr, env);
            case "str.split": return this.strSplit(expr, env);
            case "str.concat": return this.strConcat(expr, env);
        }
        return "##not-resolved##";
    }
    strLength(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        return typeof str === "string" ? str.length : -1;
    }
    strHas(expr, env) {
        const elem = this.inter.evalExpr(expr[1], env);
        const str = this.inter.evalExpr(expr[2], env);
        return str.includes(elem);
    }
    strSplit(expr, env) {
        const sep = this.inter.evalExpr(expr[1], env);
        const str = this.inter.evalExpr(expr[2], env);
        return str.split(sep);
    }
    strConcat(expr, env) {
        const str1 = this.inter.evalExpr(expr[1], env);
        const str2 = this.inter.evalExpr(expr[2], env);
        return str1 + str2;
    }
}
class Grammar {
    static isParen(ch) {
        return Grammar.isOpenParen(ch) || Grammar.isCloseParen(ch);
    }
    static isOpenParen(ch) {
        return Grammar.openParenChars.indexOf(ch) > -1;
    }
    static isCloseParen(ch) {
        return Grammar.closeParenChars.indexOf(ch) > -1;
    }
    static isWhiteSpace(ch) {
        return Grammar.whiteSpaceChars.indexOf(ch) > -1 ||
            Grammar.endOfLineChars.indexOf(ch) > -1;
    }
    static isStringEnclosureChar(ch) {
        return Grammar.stringEncloseChars.indexOf(ch) > -1;
    }
    static isLineComment(ch) {
        return Grammar.commentStartChars.indexOf(ch) > -1;
    }
    static isEndOfLine(ch) {
        return Grammar.endOfLineChars.indexOf(ch) > -1;
    }
    static isTextNumber(text) {
        return Grammar.numberRegExp.test(text);
    }
    static isNumber(token) {
        return typeof token === "number";
    }
}
Grammar.numberRegExp = /^[-+]?\d+(?:-\d\d\d)*(?:\.\d+)*$/;
Grammar.openParenChars = ["(", "[", "{"];
Grammar.closeParenChars = [")", "]", "}"];
Grammar.whiteSpaceChars = [" ", "\t"];
Grammar.endOfLineChars = ["\r", "\n"];
Grammar.commentStartChars = [";"];
Grammar.stringEncloseChars = ["\""];
class Lexer {
    static splitCode(code) {
        const lexList = [];
        for (let i = 0, symbol = ""; i < code.length; i++) {
            const ch = code[i];
            const pushSymbol = () => {
                if (symbol === "")
                    return;
                if (Grammar.isTextNumber(symbol)) {
                    const number = Lexer.parseNumber(symbol);
                    lexList.push(number);
                }
                else {
                    lexList.push(symbol);
                }
                symbol = "";
            };
            if (Grammar.isStringEnclosureChar(ch)) {
                const charList = [];
                for (i++; i < code.length; i++) {
                    const c = code[i];
                    if (Grammar.isStringEnclosureChar(c)) {
                        break;
                    }
                    else {
                        charList.push(c);
                    }
                }
                const str = charList.join("");
                lexList.push('(');
                lexList.push('string');
                lexList.push(str);
                lexList.push(')');
            }
            else if (Grammar.isLineComment(ch)) {
                for (; i < code.length; i++) {
                    const c = code[i];
                    if (Grammar.isEndOfLine(c)) {
                        break;
                    }
                }
            }
            else if (Grammar.isParen(ch)) {
                pushSymbol();
                lexList.push(ch);
                if (ch === "[") {
                    lexList.push("list");
                }
            }
            else if (Grammar.isWhiteSpace(ch)) {
                pushSymbol();
            }
            else {
                symbol += ch;
                if (i === code.length - 1) {
                    pushSymbol();
                }
            }
        }
        return lexList;
    }
    static parseNumber(numberText) {
        const isNegative = numberText[0] === "-";
        const cleanedNumbText = numberText.replace(/-/g, "");
        const parsedNumber = Number(cleanedNumbText);
        const number = isNegative ? -parsedNumber : parsedNumber;
        return number;
    }
}
if (typeof module === "object") {
    module.exports.Lexer = Lexer;
}
class Parser {
    static parse(codeText) {
        const lexTree = Lexer.splitCode(codeText);
        const quotedLexTree = Parser.quoteSymbols(lexTree);
        const fixedLexTree = Parser.replaceParens(quotedLexTree);
        const joinedLexTree = Parser.joinLexTree(fixedLexTree);
        const codeTree = Parser.tokenize(joinedLexTree);
        return codeTree;
    }
    static quoteSymbols(lexTree) {
        const result = [];
        for (let i = 0; i < lexTree.length; i++) {
            const token = lexTree[i];
            if (Grammar.isNumber(token)) {
                result.push(token);
            }
            else if (Grammar.isParen(token)) {
                result.push(token);
            }
            else {
                result.push("\"" + token + "\"");
            }
        }
        return result;
    }
    static replaceParens(lexTree) {
        const result = [];
        for (let i = 0; i < lexTree.length; i++) {
            const token = lexTree[i];
            switch (token) {
                case "(":
                case "{":
                    result.push("[");
                    break;
                case ")":
                case "}":
                    result.push("]");
                    break;
                default:
                    result.push(token);
            }
        }
        return result;
    }
    static joinLexTree(lexTree) {
        const result = [];
        for (let i = 0; i < lexTree.length; i++) {
            if (lexTree[i] === "[") {
                let parens = "";
                for (; lexTree[i] === "["; i++) {
                    parens += lexTree[i];
                }
                result.push(parens += lexTree[i]);
            }
            else if (lexTree[i] === "]") {
                let parens = "";
                for (; lexTree[i] === "]"; i++) {
                    parens += lexTree[i];
                }
                result[result.length - 1] += parens;
                i--;
            }
            else {
                result.push(lexTree[i]);
            }
        }
        return result.join(",");
    }
    static tokenize(lexText) {
        const fixedTree = "[" + lexText + "]";
        const codeTree = JSON.parse(fixedTree);
        return codeTree;
    }
}
if (typeof module === "object") {
    module.exports.Parser = Parser;
}
