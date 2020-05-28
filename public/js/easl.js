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
        this.isDebug = false;
        this.libs = [];
        this.options = new Options();
    }
    evalCodeTree(codeTree, options, callback) {
        this.options = options;
        this.libs.push(...LibManager.getBuiltinLibs(options.libs, this));
        if (typeof callback === "function") {
            LibManager.manageImports(codeTree, this.manageImport_ready.bind(this, callback));
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
        }
        switch (typeof expr) {
            case "number": return expr;
            case "string": return this.lookup(expr, env);
        }
        if (expr[0] === undefined) {
            throw "Error: Improper function application. Probably: ()";
        }
        switch (expr[0]) {
            case "list": return this.mapExprLst(expr.slice(1), env);
            case "string": return this.evalString(expr);
        }
        switch (expr[0]) {
            case "break": return "break";
            case "continue": return "continue";
        }
        if (this.isDebug) {
            this.isDebug = false;
            this.dumpExpression(expr);
        }
        switch (expr[0]) {
            case "and": return this.evalAnd(expr, env);
            case "block": return this.evalBlock(expr, env);
            case "call": return this.evalCall(expr, env);
            case "case": return this.evalCase(expr, env);
            case "cond": return this.evalCond(expr, env);
            case "debug": return this.evalDebug(env);
            case "dec": return this.evalDecrement(expr, env);
            case "delete": return this.evalDelete(expr, env);
            case "do": return this.evalDo(expr, env);
            case "enum": return this.evalEnum(expr, env);
            case "for": return this.evalFor(expr, env);
            case "if": return this.evalIf(expr, env);
            case "inc": return this.evalIncrement(expr, env);
            case "lambda": return this.evalLambda(expr, env);
            case "let": return this.evalLet(expr, env);
            case "or": return this.evalOr(expr, env);
            case "quote": return this.evalQuote(expr);
            case "repeat": return this.evalRepeat(expr, env);
            case "set": return this.evalSet(expr, env);
            case "throw": return this.evalThrow(expr, env);
            case "try": return this.evalTry(expr, env);
            case "unless": return this.evalUnless(expr, env);
            case "when": return this.evalWhen(expr, env);
            case "while": return this.evalWhile(expr, env);
        }
        const identifier = expr[0];
        for (const lib of this.libs) {
            if (lib.builtinHash[identifier]) {
                return lib.libEvalExpr(expr, env);
            }
        }
        return this.callProc(expr, env);
    }
    isTruthy(value) {
        return !this.isFaulty(value);
    }
    isFaulty(value) {
        return (Array.isArray(value) && value.length === 0)
            ? true
            : !value;
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
    throwOnExistingDef(symbol, env) {
        for (let i = env.length - 1; i > -1; i--) {
            const cellKey = env[i][0];
            if (cellKey === "#scope")
                return;
            if (cellKey === symbol)
                throw `Error: Identifier already defined: ${symbol}`;
        }
    }
    setInEnv(symbol, value, env) {
        for (let i = env.length - 1; i > -1; i--) {
            if (symbol === env[i][0]) {
                env[i][1] = value;
                return;
            }
        }
        throw `Error: Unbound identifier: ${symbol}`;
    }
    callProc(expr, env) {
        const proc = expr[0];
        const isNamed = typeof proc === "string";
        const funcName = isNamed ? proc : proc[0];
        const closure = isNamed ? this.lookup(proc, env) : this.evalExpr(proc, env);
        if (typeof closure === "string") {
            const newExpr = expr.slice();
            newExpr[0] = closure;
            return this.evalExpr(newExpr, env);
        }
        if (!Array.isArray(closure)) {
            throw `Error: Improper function: ${closure}`;
        }
        if (closure[0] !== "closure") {
            throw `Error: Improper function application`;
        }
        return this.callClosure(expr, env, closure, funcName);
    }
    callClosure(expr, env, closure, funcName) {
        const args = expr.length === 1 ? [] : expr.length === 2
            ? [this.evalExpr(expr[1], env)]
            : this.mapExprLst(expr.slice(1), env);
        const closureBody = closure[2];
        const closureEnv = this.makeClosureEnv(funcName, closure[1], args, closure[3]);
        return this.evalExpr(closureBody, closureEnv);
    }
    makeClosureEnv(name, params, args, env) {
        const closureEnv = env.concat([["#scope", name], ["#args", args], ["#name", name]]);
        for (let i = 0; i < params.length; i++) {
            const param = params[i];
            const arg = i < args.length ? args[i] : null;
            closureEnv.push([param, arg]);
        }
        return closureEnv;
    }
    evalString(expr) {
        if (expr.length !== 2) {
            throw "Error: 'string' requires 1 argument. Given: " + (expr.length - 1);
        }
        return expr[1];
    }
    evalLet(expr, env) {
        const symbol = expr[1];
        this.throwOnExistingDef(symbol, env);
        if (!Array.isArray(expr[2]) && expr.length !== 3) {
            throw "Error: 'let' requires a symbol and a value.";
        }
        const value = expr.length === 3
            ? this.evalLetValue(expr, env)
            : this.evalLetValue(["let", symbol, ["lambda", expr[2], ...expr.slice(3)]], env);
        env.push([symbol, value]);
        return null;
    }
    evalLetValue(expr, env) {
        const letExpr = expr[2];
        const res = (Array.isArray(letExpr) && letExpr[0] === "lambda")
            ? this.evalLambda(letExpr, env)
            : this.evalExpr(letExpr, env);
        return res;
    }
    evalSet(expr, env) {
        if (expr.length !== 3) {
            throw "Error: 'set' requires 2 arguments. Given: " + (expr.length - 1);
        }
        const value = this.evalLetValue(expr, env);
        this.setInEnv(expr[1], value, env);
        return null;
    }
    evalDelete(expr, env) {
        if (expr.length !== 2) {
            throw "Error: 'delete' requires 1 argument. Given: " + (expr.length - 1);
        }
        const symbol = expr[1];
        for (let i = env.length - 1; i > -1; i--) {
            const cellKey = env[i][0];
            if (cellKey === "#scope")
                throw `Error: Unbound identifier: ${symbol}`;
            if (cellKey === symbol) {
                const cellValue = env[i][1];
                env.splice(i, 1);
                return cellValue;
            }
        }
        throw `Error: Unbound identifier: ${symbol}`;
    }
    evalIncrement(expr, env) {
        if (expr.length === 1 || expr.length > 3) {
            throw "Error: 'inc' requires 1 or 2 arguments. Given: " + (expr.length - 1);
        }
        const inc = expr.length === 2 ? 1 : this.evalExpr(expr[2], env);
        const value = this.evalExpr(expr[1], env) + inc;
        this.setInEnv(expr[1], value, env);
        return value;
    }
    evalDecrement(expr, env) {
        if (expr.length === 1 || expr.length > 3) {
            throw "Error: 'dec' requires 1 or 2 arguments. Given: " + (expr.length - 1);
        }
        const dec = expr.length === 2 ? 1 : this.evalExpr(expr[2], env);
        const value = this.evalExpr(expr[1], env) - dec;
        this.setInEnv(expr[1], value, env);
        return value;
    }
    evalBlock(expr, env) {
        if (expr.length === 1)
            throw "Error: Empty block";
        env.push(["#scope", "block"]);
        const res = expr.length === 2
            ? this.evalExpr(expr[1], env)
            : this.evalExprLst(expr.slice(1), env);
        this.clearEnv("#scope", env);
        return res;
    }
    clearEnv(tag, env) {
        let cell;
        do {
            cell = env.pop();
        } while (cell[0] !== tag);
    }
    evalLambda(expr, env) {
        if (expr.length < 3)
            throw "Error: Improper function";
        if (!Array.isArray(expr[1]))
            throw "Error: Improper function parameters";
        const params = expr[1];
        const body = expr.length === 3 ? expr[2] : ["block", ...expr.slice(2)];
        return ["closure", params, body, env];
    }
    evalIf(expr, env) {
        if (expr.length < 3 || expr.length > 4) {
            throw "Error: 'if' requires 2 or 3 arguments. Given: " + (expr.length - 1);
        }
        return this.isTruthy(this.evalExpr(expr[1], env))
            ? this.evalExpr(expr[2], env)
            : expr.length === 4
                ? this.evalExpr(expr[3], env)
                : null;
    }
    evalUnless(expr, env) {
        if (expr.length < 3 || expr.length > 4) {
            throw "Error: 'unless' requires 2 or 3 arguments. Given: " + (expr.length - 1);
        }
        return this.isFaulty(this.evalExpr(expr[1], env))
            ? this.evalExpr(expr[2], env)
            : expr.length === 4
                ? this.evalExpr(expr[3], env)
                : null;
    }
    evalWhen(expr, env) {
        if (expr.length === 1) {
            throw "Error: Empty 'when'";
        }
        if (expr.length === 2) {
            throw "Error: Empty 'when' block";
        }
        if (!this.isTruthy(this.evalExpr(expr[1], env))) {
            return null;
        }
        env.push(["#scope", "when"]);
        const res = expr.length === 3
            ? this.evalExpr(expr[2], env)
            : this.evalExprLst(expr.slice(2), env);
        this.clearEnv("#scope", env);
        return res;
    }
    evalCond(expr, env) {
        const clauses = expr.slice(1);
        env.push(["#scope", "cond"]);
        for (const clause of clauses) {
            if (clause[0] === "else" || this.evalExpr(clause[0], env)) {
                const res = clause.length === 2
                    ? this.evalExpr(clause[1], env)
                    : this.evalExprLst(clause.slice(1), env);
                this.clearEnv("#scope", env);
                return res;
            }
        }
        this.clearEnv("#scope", env);
        return null;
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
                    : this.evalExprLst(clause.slice(1), env);
                this.clearEnv("#scope", env);
                return res;
            }
        }
        return null;
    }
    evalFor(expr, env) {
        const symbol = expr[1];
        const range = this.evalExpr(expr[2], env);
        const loopBody = expr.slice(3);
        if (!Array.isArray(range))
            throw `Error: No range provided in 'for'`;
        if (range.length === 0)
            return null;
        for (const elem of range) {
            env.push(["#scope", "for"]);
            env.push([symbol, elem]);
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue")
                    break;
                if (res === "break") {
                    this.clearEnv("#scope", env);
                    return null;
                }
            }
            this.clearEnv("#scope", env);
        }
        return null;
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
                    return null;
                }
            }
            this.clearEnv("#scope", env);
        }
        return null;
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
                    return null;
                }
            }
            this.clearEnv("#scope", env);
        } while (this.evalExpr(testExpr, env));
        return null;
    }
    evalEnum(expr, env) {
        for (let i = 1; i < expr.length; i++) {
            const symbol = expr[i];
            this.throwOnExistingDef(symbol, env);
            env.push([symbol, i - 1]);
        }
        return null;
    }
    evalRepeat(expr, env) {
        const count = this.evalExpr(expr[1], env);
        if (typeof count !== "number")
            throw `Error: Wrong count in 'repeat'`;
        const loopBody = expr.slice(2);
        for (let i = 0; i < count; i++) {
            env.push(["#scope", "repeat"]);
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue")
                    break;
                if (res === "break") {
                    this.clearEnv("#scope", env);
                    return null;
                }
            }
            this.clearEnv("#scope", env);
        }
        return null;
    }
    evalCall(expr, env) {
        const procId = expr[1];
        const callArgs = Array.isArray(expr[2]) && expr[2][0] === "list"
            ? expr[2].slice(1)
            : this.evalExpr(expr[2], env);
        for (let i = 0; i < callArgs.length; i++) {
            const elm = callArgs[i];
            if (typeof elm === "string" && !["true", "false", "null"].includes(elm)) {
                callArgs[i] = ["string", elm];
            }
            else if (elm === true) {
                callArgs[i] = "true";
            }
            else if (elm === false) {
                callArgs[i] = "false";
            }
            else if (elm === null) {
                callArgs[i] = "null";
            }
        }
        return this.evalExpr([procId, ...callArgs], env);
    }
    evalAnd(expr, env) {
        if (expr.length === 1) {
            return true;
        }
        if (expr.length === 2) {
            return this.evalExpr(expr[1], env);
        }
        if (expr.length === 3) {
            const val = this.evalExpr(expr[1], env);
            return this.isTruthy(val) ? this.evalExpr(expr[2], env) : val;
        }
        const val = this.evalExpr(expr[1], env);
        return this.isTruthy(val) ? this.evalAnd(expr.slice(1), env) : val;
    }
    evalQuote(expr) {
        if (expr.length !== 2) {
            throw "Error: 'quote' requires 1 argument. Given: " + (expr.length - 1);
        }
        return expr[1];
    }
    evalOr(expr, env) {
        switch (expr.length) {
            case 1:
                return false;
            case 2:
                return this.evalExpr(expr[1], env);
            case 3:
                const val = this.evalExpr(expr[1], env);
                return this.isTruthy(val)
                    ? val
                    : this.evalExpr(expr[2], env);
        }
        const val = this.evalExpr(expr[1], env);
        return this.isTruthy(val)
            ? val
            : this.evalOr(expr.slice(1), env);
    }
    evalTry(expr, env) {
        try {
            env.push(["#scope", "try"]);
            const res = expr.length === 3
                ? this.evalExpr(expr[2], env)
                : this.evalExprLst(expr.slice(2), env);
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
            return this.callProc([catchExpr, ["string", errorMessage]], env);
        }
        if (Array.isArray(catchExpr)) {
            if (catchExpr[0] === "lambda") {
                return this.callProc([catchExpr, ["string", errorMessage]], env);
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
    evalDebug(env) {
        this.dumpEnvironment(env);
        this.isDebug = true;
        return null;
    }
    dumpEnvironment(env) {
        const getCircularReplacer = () => {
            const seen = [];
            return (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.indexOf(value) > -1)
                        return;
                    seen.push(value);
                }
                return value;
            };
        };
        const envDumpList = [];
        const maxLength = Math.min(env.length - 1, 10);
        for (let i = maxLength; i > -1; i--) {
            const record = env[i];
            envDumpList.push(`${record[0]} : ${JSON.stringify(record[1], getCircularReplacer()).substr(0, 500)}`);
        }
        const envDumpText = envDumpList.join("\n      ");
        const message = `Env : ${envDumpText}`;
        this.options.printer(message);
        return null;
    }
    dumpExpression(expr) {
        const message = `Expr: ${JSON.stringify(expr)}`;
        this.options.printer(message);
        return null;
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
        this.isParen = (ch) => this.isOpenParen(ch) || this.isCloseParen(ch);
        this.isOpenParen = (ch) => ["(", "[", "{"].includes(ch);
        this.isCloseParen = (ch) => [")", "]", "}"].includes(ch);
        this.isQuoteAbbrev = (ch) => ch === "'";
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
        const codeList = this.tokenize(fixedText);
        const expandedQSymbols = this.expandQuotedSymbol(codeList);
        const expandedQLists = this.expandQuotedList(expandedQSymbols);
        const ilTree = this.nest(expandedQLists);
        return ilTree;
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
            if (this.isParen(ch) || this.isQuoteAbbrev(ch)) {
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
    expandQuotedSymbol(input) {
        const output = [];
        for (let i = 0; i < input.length; i++) {
            const curr = input[i];
            const next = input[i + 1];
            if (this.isQuoteAbbrev(curr) && !this.isOpenParen(next) && !this.isQuoteAbbrev(next)) {
                output.push("(", "quote", next, ")");
                i++;
            }
            else {
                output.push(curr);
            }
        }
        return output;
    }
    expandQuotedList(input) {
        const output = [];
        for (let i = 0, paren = 0, flag = false; i < input.length; i++) {
            const curr = input[i];
            const next = input[i + 1];
            if (!flag && this.isQuoteAbbrev(curr) && this.isOpenParen(next)) {
                output.push("(", "quote");
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
            ? this.expandQuotedList(output)
            : output;
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
            texts.push("lambda (" + closure[1].join(" ") + ") (");
            loop(closure[2]);
            texts.push(")");
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
class CoreLib {
    constructor(interpreter) {
        this.builtinFunc = ["!=", "%", "*", "+", "-", "/", "<", "<=", "=", ">", ">=", "eval", "not",
            "parse", "print", "to-boolean", "to-number", "to-string", "type-of", "display", "newline"];
        this.builtinHash = {};
        this.inter = interpreter;
        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "+": return this.evalPlus(expr, env);
            case "-": return this.evalSubtract(expr, env);
            case "*": return this.evalMultiply(expr, env);
            case "/": return this.evalDivide(expr, env);
            case "%": return this.evalModulo(expr, env);
            case "=": return this.evalEqual(expr, env);
            case "!=": return this.evalNotEqual(expr, env);
            case ">": return this.evalGreater(expr, env);
            case ">=": return this.evalGreaterOrEqual(expr, env);
            case "<": return this.evalLower(expr, env);
            case "<=": return this.evalLowerOrEqual(expr, env);
            case "not": return this.evalNot(expr, env);
            case "type-of": return this.evalTypeOf(expr, env);
            case "to-string": return this.evalToString(expr, env);
            case "to-number": return this.evalToNumber(expr, env);
            case "to-boolean": return this.evalToBoolean(expr, env);
            case "parse": return this.evalParse(expr, env);
            case "eval": return this.evalEval(expr, env);
            case "print": return this.evalPrint(expr, env);
            case "display": return this.evalDisplay(expr, env);
            case "newline": return this.evalNewline(expr);
        }
        throw "Error: Not found in 'core-lib': " + expr[0];
    }
    evalPlus(expr, env) {
        if (expr.length === 1) {
            return 0;
        }
        const a = this.inter.evalExpr(expr[1], env);
        if (expr.length === 2) {
            if (typeof a === "string" || typeof a === "number") {
                return a;
            }
            throw Error("Wrong parameter type: " + "+");
        }
        if (expr.length === 3) {
            const b = this.inter.evalExpr(expr[2], env);
            if (typeof a === "string") {
                if (typeof b === "string") {
                    return a + b;
                }
                if (typeof b === "number") {
                    return a + b.toString();
                }
                throw Error("Wrong parameter types: " + "+");
            }
            if (typeof a === "number" && typeof b === "number") {
                return a + b;
            }
            throw Error("Wrong parameter types: " + "+");
        }
        return a + this.evalPlus(expr.slice(1), env);
    }
    evalSubtract(expr, env) {
        if (expr.length === 2) {
            return -this.inter.evalExpr(expr[1], env);
        }
        if (expr.length === 3) {
            return this.inter.evalExpr(expr[1], env) - this.inter.evalExpr(expr[2], env);
        }
        throw "Error: '-' requires 2 arguments. Given: " + (expr.length - 1);
    }
    evalMultiply(expr, env) {
        if (expr.length === 1) {
            return 0;
        }
        const a = this.inter.evalExpr(expr[1], env);
        if (typeof a !== "number") {
            throw Error("Wrong parameter type: " + "*");
        }
        if (expr.length === 2) {
            return a;
        }
        if (expr.length === 3) {
            if (a === 0) {
                return 0;
            }
            const b = this.inter.evalExpr(expr[2], env);
            if (typeof b !== "number") {
                throw Error("Wrong parameter type: " + "*");
            }
            return a * b;
        }
        return a * this.evalMultiply(expr.slice(1), env);
    }
    evalDivide(expr, env) {
        if (expr.length !== 3) {
            throw "Error: '/' requires 2 arguments. Given: " + (expr.length - 1);
        }
        const divisor = this.inter.evalExpr(expr[2], env);
        if (divisor === 0) {
            throw Error("Error: '/' - division by zero");
        }
        return this.inter.evalExpr(expr[1], env) / divisor;
    }
    evalModulo(expr, env) {
        if (expr.length !== 3) {
            throw "Error: '%' requires 2 arguments. Given: " + (expr.length - 1);
        }
        return this.inter.evalExpr(expr[1], env) % this.inter.evalExpr(expr[2], env);
    }
    evalEqual(expr, env) {
        if (expr.length === 3) {
            return this.inter.evalExpr(expr[1], env) === this.inter.evalExpr(expr[2], env);
        }
        if (expr.length > 3) {
            const first = this.inter.evalExpr(expr[1], env);
            for (let i = 2; i < expr.length; i++) {
                if (this.inter.evalExpr(expr[i], env) !== first) {
                    return false;
                }
            }
            return true;
        }
        throw "Error: '=' requires 2 or more arguments. Given: " + (expr.length - 1);
    }
    evalGreater(expr, env) {
        if (expr.length !== 3) {
            throw "Error: '>' requires 2 arguments. Given: " + (expr.length - 1);
        }
        return this.inter.evalExpr(expr[1], env) > this.inter.evalExpr(expr[2], env);
    }
    evalLower(expr, env) {
        if (expr.length !== 3) {
            throw "Error: '<' requires 2 arguments. Given: " + (expr.length - 1);
        }
        return this.inter.evalExpr(expr[1], env) < this.inter.evalExpr(expr[2], env);
    }
    evalNotEqual(expr, env) {
        if (expr.length !== 3) {
            throw "Error: '!=' requires 2 arguments. Given: " + (expr.length - 1);
        }
        return this.inter.evalExpr(expr[1], env) !== this.inter.evalExpr(expr[2], env);
    }
    evalGreaterOrEqual(expr, env) {
        if (expr.length !== 3) {
            throw "Error: '>=' requires 2 arguments. Given: " + (expr.length - 1);
        }
        return this.inter.evalExpr(expr[1], env) >= this.inter.evalExpr(expr[2], env);
    }
    evalLowerOrEqual(expr, env) {
        if (expr.length !== 3) {
            throw "Error: '<=' requires 2 arguments. Given: " + (expr.length - 1);
        }
        return this.inter.evalExpr(expr[1], env) <= this.inter.evalExpr(expr[2], env);
    }
    evalNot(expr, env) {
        if (expr.length !== 2) {
            throw "Error: 'not' requires 1 argument. Given: " + (expr.length - 1);
        }
        const entity = this.inter.evalExpr(expr[1], env);
        return (Array.isArray(entity) && entity.length === 0) || !entity;
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
                case "function":
                case "closure": return "function";
            }
        }
        if (entity === "null") {
            return "null";
        }
        const value = this.inter.evalExpr(entity, env);
        if (Array.isArray(value)) {
            switch (value[0]) {
                case "lambda":
                case "function":
                case "closure": return "function";
            }
            return "list";
        }
        if (value === null) {
            return "null";
        }
        return typeof value;
    }
    evalToBoolean(expr, env) {
        if (expr.length !== 2) {
            throw "Error: 'to-boolean' requires 1 argument. Given: " + (expr.length - 1);
        }
        return !this.evalNot(expr, env);
    }
    evalToNumber(expr, env) {
        if (expr.length !== 2) {
            throw "Error: 'to-number' requires 1 argument. Given: " + (expr.length - 1);
        }
        const entity = this.inter.evalExpr(expr[1], env);
        const number = Number(entity);
        return number !== number ? null : number;
    }
    evalParse(expr, env) {
        if (expr.length !== 2) {
            throw "Error: 'parse' requires 2 arguments. Given: " + (expr.length - 1);
        }
        const codeText = this.inter.evalExpr(expr[1], env);
        const parser = new Parser();
        return parser.parse(codeText);
    }
    evalEval(expr, env) {
        if (expr.length !== 2) {
            throw "Error: 'eval' requires 1 argument. Given: " + (expr.length - 1);
        }
        const codeTree = this.inter.evalExpr(expr[1], env);
        return this.inter.evalCodeTree(codeTree, this.inter.options);
    }
    evalPrint(expr, env) {
        if (expr.length === 1) {
            this.inter.options.printer("\r\n");
        }
        else if (expr.length === 2) {
            const text = this.evalToString(expr, env);
            this.inter.options.printer(text + "\r\n");
        }
        else {
            const text = this.inter.mapExprLst(expr.slice(1), env)
                .map((e) => Printer.stringify(e))
                .join(" ");
            this.inter.options.printer(text + "\r\n");
        }
        return null;
    }
    evalDisplay(expr, env) {
        if (expr.length !== 2) {
            throw "Error: 'display' requires 1 argument. Given: " + (expr.length - 1);
        }
        const text = this.evalToString(expr, env);
        this.inter.options.printer(text);
        return null;
    }
    evalNewline(expr) {
        if (expr.length !== 1) {
            throw "Error: 'newline' requires 0 arguments. Given: " + (expr.length - 1);
        }
        this.inter.options.printer("\r\n");
        return null;
    }
    evalToString(expr, env) {
        if (expr.length !== 2) {
            throw "Error: 'to-string' requires 1 argument. Given: " + (expr.length - 1);
        }
        const res = this.inter.evalExpr(expr[1], env);
        return Printer.stringify(res);
    }
}
class DateLib {
    constructor(interpreter) {
        this.builtinFunc = ["date.now", "date.to-string"];
        this.builtinHash = {};
        this.inter = interpreter;
        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "date.now": return Date.now();
            case "date.to-string": return (new Date(this.inter.evalExpr(expr[1], env))).toString();
        }
        throw "Error: Not found in 'date-lib': " + expr[0];
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
        if (this.builtinFunc.indexOf(funcName) === -1) {
            throw "Error: Not found in 'ext-lib': " + funcName;
        }
        const argsList = this.inter.mapExprLst(expr.slice(1), env);
        return this.inter.options.extFunctions[funcName].apply(this.inter.options.extContext, argsList);
    }
}
class ListLib {
    constructor(interpreter) {
        this.builtinFunc = ["list.add", "list.concat", "list.dec", "list.first", "list.flatten", "list.get",
            "list.has", "list.inc", "list.index", "list.join", "list.last", "list.less", "list.length", "list.push",
            "list.range", "list.reverse", "list.rest", "list.set", "list.slice", "list.sort"];
        this.builtinHash = {};
        this.inter = interpreter;
        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "list.add": return this.listAdd(expr, env);
            case "list.concat": return this.listConcat(expr, env);
            case "list.dec": return this.listDec(expr, env);
            case "list.first": return this.listFirst(expr, env);
            case "list.flatten": return this.listFlatten(expr, env);
            case "list.get": return this.listGet(expr, env);
            case "list.has": return this.listHas(expr, env);
            case "list.inc": return this.listInc(expr, env);
            case "list.index": return this.listIndex(expr, env);
            case "list.join": return this.listJoin(expr, env);
            case "list.last": return this.listLast(expr, env);
            case "list.length": return this.listLength(expr, env);
            case "list.less": return this.listLess(expr, env);
            case "list.push": return this.listPush(expr, env);
            case "list.range": return this.listRange(expr, env);
            case "list.reverse": return this.listReverse(expr, env);
            case "list.rest": return this.listRest(expr, env);
            case "list.set": return this.listSet(expr, env);
            case "list.slice": return this.listSlice(expr, env);
            case "list.sort": return this.listSort(expr, env);
        }
        throw "Error: Not found in 'list-lib': " + expr[0];
    }
    listAdd(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        const elm = this.inter.evalExpr(expr[2], env);
        if (Array.isArray(lst)) {
            lst.push(elm);
            return lst;
        }
        if (lst === null) {
            return [elm];
        }
        return [lst, elm];
    }
    listConcat(expr, env) {
        const lst1 = this.inter.evalExpr(expr[1], env);
        const lst2 = this.inter.evalExpr(expr[2], env);
        return Array.isArray(lst1) ? lst1.concat(lst2) : lst1;
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
        const lst = this.inter.evalExpr(expr[1], env);
        const index = this.inter.evalExpr(expr[2], env);
        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            return lst[index];
        }
        return null;
    }
    listHas(expr, env) {
        return this.listIndex(expr, env) > -1;
    }
    listIndex(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        const elm = this.inter.evalExpr(expr[2], env);
        if (Array.isArray(lst)) {
            return lst.indexOf(elm);
        }
        return -1;
    }
    listInc(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        const elm = this.inter.evalExpr(expr[2], env);
        return ++lst[elm];
    }
    listDec(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        const elm = this.inter.evalExpr(expr[2], env);
        return --lst[elm];
    }
    listJoin(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        const sep = expr.length === 3 ? this.inter.evalExpr(expr[2], env) : ",";
        return lst.join(sep);
    }
    listLast(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 0 ? lst[lst.length - 1] : null;
    }
    listLess(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 1 ? lst.slice(0, lst.length - 1) : [];
    }
    listLength(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) ? lst.length : -1;
    }
    listPush(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        const elm = this.inter.evalExpr(expr[2], env);
        if (Array.isArray(lst)) {
            lst.unshift(elm);
            return lst;
        }
        if (lst === null) {
            return [elm];
        }
        return [elm, lst];
    }
    listRange(expr, env) {
        const start = this.inter.evalExpr(expr[1], env);
        const end = this.inter.evalExpr(expr[2], env);
        if (typeof start !== "number")
            throw "Error: The 'start' parameter must be a number in 'list.range'.";
        if (typeof end !== "number")
            throw "Error: The 'end' parameter must be a number in 'list.range'.";
        if (start === end)
            return [start];
        const step = expr.length === 4
            ? this.inter.evalExpr(expr[3], env)
            : end > start ? 1 : -1;
        if (typeof step !== "number")
            throw "Error: The 'step' parameter must be a number in 'list.range'.";
        if (step === 0)
            throw "Error: The 'step' parameter cannot be 0 in 'list.range'.";
        if (step > 0 && end < start)
            throw "Error: The 'step' parameter cannot be lower than 0 in a rising list in 'list.range'.";
        if (step < 0 && end > start)
            throw "Error: The 'step' parameter cannot be higher than 0 in a lowering list 'list.range'.";
        const res = [];
        if (end > start) {
            for (let i = start; i <= end; i += step) {
                res.push(i);
            }
        }
        else {
            for (let i = start; i >= end; i += step) {
                res.push(i);
            }
        }
        return res;
    }
    listRest(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 1 ? lst.slice(1) : [];
    }
    listReverse(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return lst.reverse();
    }
    listSet(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        const index = this.inter.evalExpr(expr[2], env);
        const elm = this.inter.evalExpr(expr[3], env);
        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            lst[index] = elm;
            return lst;
        }
        return lst;
    }
    listSlice(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        const args = expr.length - 2;
        const begin = args > 0 ? this.inter.evalExpr(expr[2], env) : 0;
        const end = args > 1 ? this.inter.evalExpr(expr[3], env) : lst.length;
        return lst.slice(begin, end);
    }
    listSort(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return lst.sort();
    }
}
class MathLib {
    constructor(interpreter) {
        this.builtinFunc = ["math.pi", "math.abs", "math.ceil", "math.floor", "math.log", "math.ln", "math.max",
            "math.min", "math.pow", "math.random", "math.round", "math.sqrt"];
        this.builtinHash = {};
        this.inter = interpreter;
        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
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
        throw "Error: Not found in 'math-lib': " + expr[0];
    }
}
class NumberLib {
    constructor(interpreter) {
        this.builtinFunc = ["numb.max-value", "numb.min-value", "numb.parse-float", "numb.parse-int",
            "numb.is-finite", "numb.is-integer", "numb.to-fixed", "numb.to-string"];
        this.builtinHash = {};
        this.inter = interpreter;
        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "numb.max-value": return Number.MAX_VALUE;
            case "numb.min-value": return Number.MIN_VALUE;
            case "numb.parse-float": return this.evalParseFloat(expr, env);
            case "numb.parse-int": return this.evalParseInt(expr, env);
            case "numb.is-finite": return this.evalIsFinite(expr, env);
            case "numb.is-integer": return this.evalIsInteger(expr, env);
            case "numb.to-fixed": return this.evalToFixed(expr, env);
            case "numb.to-string": return this.evalToString(expr, env);
        }
        throw "Error: Not found in 'numb-lib': " + expr[0];
    }
    evalParseFloat(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        const res = parseFloat(value);
        if (isNaN(res))
            throw "Error: Not a number: " + value;
        return res;
    }
    evalParseInt(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        const res = parseInt(value);
        if (isNaN(res))
            throw "Error: Not a number: " + value;
        return res;
    }
    evalIsFinite(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        return typeof value === "number" && isFinite(value);
    }
    evalIsInteger(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    }
    evalToFixed(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        const digits = expr[2] ? this.inter.evalExpr(expr[2], env) : 0;
        return value.toFixed(digits);
    }
    evalToString(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        return value.toString();
    }
}
class StringLib {
    constructor(interpreter) {
        this.methods = {
            "str.char-at": this.strCharAt,
            "str.char-code-at": this.strCharCodeAt,
            "str.concat": this.strConcat,
            "str.ends-with": this.strEndsWith,
            "str.from-char-code": this.strFromCharCode,
            "str.includes": this.strIncludes,
            "str.index-of": this.strIndexOf,
            "str.last-index-of": this.strLastIndexOf,
            "str.length": this.strLength,
            "str.match": this.strMatch,
            "str.repeat": this.strRepeat,
            "str.replace": this.strReplace,
            "str.split": this.strSplit,
            "str.starts-with": this.strStartsWith,
            "str.sub-string": this.strSubString,
            "str.trim": this.strTrim,
            "str.trim-left": this.strTrimLeft,
            "str.trim-right": this.strTrimRight,
            "str.to-lowercase": this.strToLowercase,
            "str.to-uppercase": this.strToUppercase,
        };
        this.builtinHash = {};
        this.inter = interpreter;
        this.builtinFunc = Object.keys(this.methods);
        for (const func of this.builtinFunc) {
            this.builtinHash[func] = true;
        }
    }
    libEvalExpr(expr, env) {
        const methodName = expr[0];
        if (this.methods.hasOwnProperty(methodName)) {
            return this.methods[methodName].call(this, expr, env);
        }
        throw "Error: Not found in 'string-lib': " + expr[0];
    }
    strCharAt(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        const pos = this.inter.evalExpr(expr[2], env);
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        if (typeof pos !== "number") {
            throw Error("Not a number: " + pos);
        }
        return pos >= 0 && pos < str.length
            ? str.charAt(pos)
            : null;
    }
    strCharCodeAt(expr, env) {
        const char = this.strCharAt(expr, env);
        if (typeof char !== "string") {
            throw Error("Not a character: " + char);
        }
        return char.charCodeAt(0);
    }
    strConcat(expr, env) {
        const args = this.inter.mapExprLst(expr.slice(1), env);
        const strList = args.map((e) => {
            return String(e);
        });
        const res = strList.reduce((acc, e) => {
            return acc + e;
        }, "");
        return res;
    }
    strEndsWith(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        const search = this.inter.evalExpr(expr[2], env);
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        if (typeof search !== "string") {
            throw Error("Not a string: " + search);
        }
        return str.lastIndexOf(search) === str.length - search.length;
    }
    strFromCharCode(expr, env) {
        const code = this.inter.evalExpr(expr[1], env);
        if (typeof code !== "number") {
            throw Error("Not a number: " + code);
        }
        return String.fromCharCode(code);
    }
    strIncludes(expr, env) {
        const haystack = this.inter.evalExpr(expr[1], env);
        const needle = this.inter.evalExpr(expr[2], env);
        const start = expr.length === 4 ? this.inter.evalExpr(expr[3], env) : 0;
        if (typeof haystack !== "string") {
            throw Error("Not a string: " + haystack);
        }
        if (typeof needle !== "string") {
            throw Error("Not a string: " + needle);
        }
        if (typeof start !== "number") {
            throw Error("Not a number: " + start);
        }
        return haystack.includes(needle, start);
    }
    strIndexOf(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        const search = this.inter.evalExpr(expr[2], env);
        const start = expr.length === 4 ? this.inter.evalExpr(expr[3], env) : 0;
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        if (typeof search !== "string") {
            throw Error("Not a string: " + search);
        }
        if (typeof start !== "number") {
            throw Error("Not a number: " + start);
        }
        return str.indexOf(search, start);
    }
    strLastIndexOf(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        const search = this.inter.evalExpr(expr[2], env);
        const start = expr.length === 4 ? this.inter.evalExpr(expr[3], env) : str.length;
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        if (typeof search !== "string") {
            throw Error("Not a string: " + search);
        }
        if (typeof start !== "number") {
            throw Error("Not a number: " + start);
        }
        return str.lastIndexOf(search, start);
    }
    strLength(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        return str.length;
    }
    strMatch(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        const pattern = this.inter.evalExpr(expr[2], env);
        const modifiers = expr.length === 4 ? this.inter.evalExpr(expr[3], env) : "";
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        if (typeof pattern !== "string") {
            throw Error("Not a string: " + pattern);
        }
        if (typeof modifiers !== "string") {
            throw Error("Not a string: " + modifiers);
        }
        const regExp = new RegExp(pattern, modifiers);
        return str.match(regExp);
    }
    strRepeat(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        const count = this.inter.evalExpr(expr[2], env);
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        if (typeof count !== "number") {
            throw Error("Not a number: " + count);
        }
        return str.repeat(count);
    }
    strReplace(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        const pattern = this.inter.evalExpr(expr[2], env);
        const replace = this.inter.evalExpr(expr[3], env);
        const modifiers = expr.length === 5 ? this.inter.evalExpr(expr[4], env) : "";
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        if (typeof pattern !== "string") {
            throw Error("Not a string: " + pattern);
        }
        if (typeof replace !== "string") {
            throw Error("Not a string: " + replace);
        }
        if (typeof modifiers !== "string") {
            throw Error("Not a string: " + modifiers);
        }
        const regExp = new RegExp(pattern, modifiers);
        return str.replace(regExp, replace);
    }
    strSplit(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        const sep = expr.length === 2
            ? ""
            : this.inter.evalExpr(expr[2], env);
        if (typeof sep !== "string") {
            throw Error("Not a string: " + sep);
        }
        return str.split(sep);
    }
    strStartsWith(expr, env) {
        const haystack = this.inter.evalExpr(expr[1], env);
        const needle = this.inter.evalExpr(expr[2], env);
        if (typeof haystack !== "string") {
            throw Error("Not a string: " + haystack);
        }
        if (typeof needle !== "string") {
            throw Error("Not a string: " + needle);
        }
        return haystack.lastIndexOf(needle, 0) === 0;
    }
    strSubString(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        const start = expr.length > 2
            ? this.inter.evalExpr(expr[2], env)
            : 0;
        const end = expr.length === 4
            ? this.inter.evalExpr(expr[3], env)
            : str.length;
        if (typeof start !== "number") {
            throw Error("Not a number: " + start);
        }
        if (typeof end !== "number") {
            throw Error("Not a number: " + end);
        }
        return str.substring(start, end);
    }
    strTrim(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        return str.trim();
    }
    strTrimLeft(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        return str.trimLeft();
    }
    strTrimRight(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        return str.trimRight();
    }
    strToLowercase(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        return str.toLowerCase();
    }
    strToUppercase(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string") {
            throw Error("Not a string: " + str);
        }
        return str.toUpperCase();
    }
}
