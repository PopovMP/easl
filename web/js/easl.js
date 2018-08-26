"use strict";
class Easl {
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
        }
        switch (expr[0]) {
            case "list": return this.mapExprLst(expr.slice(1), env);
            case "string": return expr[1];
        }
        if (this.isDebug) {
            this.dumpState(expr, env);
        }
        switch (expr[0]) {
            case "let": return this.evalLet(expr, env);
            case "lambda": return this.evalLambda(expr, env);
            case "function": return this.evalFunction(expr, env);
            case "block": return this.evalBlock(expr, env);
            case "if": return this.evalIf(expr, env);
            case "cond": return this.evalCond(expr, env);
            case "case": return this.evalCase(expr, env);
            case "for": return this.evalFor(expr, env);
            case "while": return this.evalWhile(expr, env);
            case "do": return this.evalDo(expr, env);
            case "set!": return this.evalSet(expr, env);
            case "try": return this.evalTry(expr, env);
            case "throw": return this.evalThrow(expr, env);
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
        for (let i = env.length - 1; i > -1; i--) {
            if (symbol === env[i][0]) {
                return env[i][1];
            }
        }
        throw Error(`Unbound identifier: ${symbol}`);
    }
    throwOnExistingDef(symbol, env) {
        for (let i = env.length - 1; i > -1; i--) {
            const cellKey = env[i][0];
            if (cellKey === "#scope#")
                return;
            if (cellKey === symbol)
                throw Error(`Identifier already defined: ${symbol}`);
        }
    }
    setInEnv(symbol, value, env) {
        for (let i = env.length - 1; i > -1; i--) {
            if (symbol === env[i][0]) {
                env[i][1] = value;
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
        const funcName = isNamed ? proc : "lambda";
        const closureBody = closure[2].length === 1 && typeof closure[2][0] === "string"
            ? closure[2][0]
            : closure[2];
        if (closureBody === "block") {
            throw Error(`Improper function: ${funcName}`);
        }
        if (closureBody.length === 0 || (closureBody[0] === "block" && closureBody[1].length === 0)) {
            throw Error(`Function with empty body: ${funcName}`);
        }
        const args = expr.length === 1 ? [] : expr.length === 2
            ? [this.evalExpr(expr[1], env)]
            : this.mapExprLst(expr.slice(1), env);
        const closureEnv = this.makeProcEnv(funcName, closure[1], args, closure[3]);
        return this.evalExpr(closureBody, closureEnv);
    }
    makeProcEnv(funcName, params, args, env) {
        const closureEnv = env.concat([["func-name", funcName], ["func-params", params], ["func-args", args]]);
        if (typeof params === "string") {
            closureEnv.push([params, args.length > 0 ? args[0] : null]);
        }
        else {
            for (let i = 0; i < params.length; i++) {
                closureEnv.push([params[i], i < args.length ? args[i] : null]);
            }
        }
        return closureEnv;
    }
    evalLambda(expr, env) {
        if (expr.length !== 3) {
            throw Error(`Improper function`);
        }
        return ["closure", expr[1], expr[2], env];
    }
    evalLet(expr, env) {
        const symbol = expr[1];
        this.throwOnExistingDef(symbol, env);
        const value = this.evalLetValue(expr, env);
        env.push([symbol, value]);
        return null;
    }
    evalSet(expr, env) {
        const symbol = expr[1];
        const value = this.evalLetValue(expr, env);
        this.setInEnv(symbol, value, env);
        return null;
    }
    evalBlock(expr, env) {
        if (expr.length === 1) {
            throw Error(`Empty body`);
        }
        env.push(["#scope#", null]);
        const res = expr.length === 2
            ? this.evalExpr(expr[1], env)
            : this.evalExprLst(expr.slice(1), env);
        this.cleanEnv("#scope#", env);
        return res;
    }
    cleanEnv(tag, env) {
        let slice = [];
        do {
            slice = env.pop();
        } while (slice[0] !== tag);
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
        const body = ["block", ...expr.slice(3)];
        const value = this.evalLambda(["lambda", expr[2], body], env);
        env.push([symbol, value]);
        return null;
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
        env.push(["#scope#", null]);
        for (const clause of clauses) {
            if (clause[0] === "else" || this.evalExpr(clause[0], env)) {
                const res = this.evalExprLst(clause.slice(1), env);
                this.cleanEnv("#scope#", env);
                return res;
            }
        }
        this.cleanEnv("#scope#", env);
        return null;
    }
    evalCase(expr, env) {
        const val = this.evalExpr(expr[1], env);
        const clauses = expr.slice(2);
        env.push(["#scope#", null]);
        for (const clause of clauses) {
            if (clause[0] === "else" || this.evalExpr(clause[0], env).indexOf(val) > -1) {
                const res = this.evalExprLst(clause.slice(1), env);
                this.cleanEnv("#scope#", env);
                return res;
            }
        }
        this.cleanEnv("#scope#", env);
        return null;
    }
    evalFor(expr, env) {
        const condBody = expr[2];
        const incBody = expr[3];
        const loopBody = expr.slice(4);
        const cntId = expr[1][0];
        env.push([cntId, this.evalExpr(expr[1][1], env)]);
        while (this.evalExpr(condBody, env)) {
            env.push(["#scope#", null]);
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue")
                    break;
                if (res === "break") {
                    this.cleanEnv("#scope#", env);
                    env.pop();
                    return null;
                }
            }
            for (let i = env.length - 1; i > -1; i--) {
                if (env[i][0] === cntId) {
                    env[i][1] = this.evalExpr(incBody, env);
                    break;
                }
            }
            this.cleanEnv("#scope#", env);
        }
        env.pop();
        return null;
    }
    evalWhile(expr, env) {
        const condBody = expr[1];
        const loopBody = expr.slice(2);
        while (this.evalExpr(condBody, env)) {
            env.push(["#scope#", null]);
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue")
                    break;
                if (res === "break") {
                    this.cleanEnv("#scope#", env);
                    return null;
                }
            }
            this.cleanEnv("#scope#", env);
        }
        return null;
    }
    evalDo(expr, env) {
        const condBody = expr[expr.length - 1];
        const loopBody = expr.slice(1, expr.length - 1);
        do {
            env.push(["#scope#", null]);
            for (const bodyExpr of loopBody) {
                const res = this.evalExpr(bodyExpr, env);
                if (res === "continue")
                    break;
                if (res === "break") {
                    this.cleanEnv("#scope#", env);
                    return null;
                }
            }
            this.cleanEnv("#scope#", env);
        } while (this.evalExpr(condBody, env));
        return null;
    }
    evalTry(expr, env) {
        try {
            env.push(["#scope#", null]);
            const res = this.evalExprLst(expr.slice(2), env);
            this.cleanEnv("#scope#", env);
            return res;
        }
        catch (e) {
            this.cleanEnv("#scope#", env);
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
    evalDebug() {
        this.isDebug = true;
        return null;
    }
    dumpState(expr, env) {
        const getCircularReplacer = () => {
            const seen = new WeakSet();
            return (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value))
                        return;
                    seen.add(value);
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
            if (res !== "##not-resolved##") {
                return { resolved: true, val: res };
            }
        }
        return { resolved: false, val: null };
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
class LibManager {
    static getBuiltinLibs(libList, inter) {
        return libList.map(lib => LibManager.createLib(lib, inter));
    }
    static createLib(libName, inter) {
        switch (libName) {
            case "core-lib": return new CoreLib(inter);
            case "date-lib": return new DateLib(inter);
            case "list-lib": return new ListLib(inter);
            case "math-lib": return new MathLib(inter);
            case "number-lib": return new NumberLib(inter);
            case "string-lib": return new StringLib(inter);
            default: throw Error("Unknown lib: " + libName);
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
        this.libs = ["core-lib", "date-lib", "list-lib", "math-lib", "number-lib", "string-lib"];
    }
    static parse(options) {
        const evalOptions = new Options();
        if (typeof options.printer === "function") {
            evalOptions.printer = options.printer;
        }
        if (Array.isArray(options.libs)) {
            evalOptions.libs = options.libs.slice();
        }
        return evalOptions;
    }
}
class Parser {
    constructor() {
        this.numberRegExp = /^[-+]?\d+(?:-\d\d\d)*(?:\.\d+)*$/;
        this.openParenChars = ["(", "[", "{"];
        this.closeParenChars = [")", "]", "}"];
        this.whiteSpaceChars = [" ", "\t"];
        this.endOfLineChars = ["\r", "\n"];
        this.commentStartChars = [";"];
    }
    parse(codeText) {
        const codeTree = this.tokenize(codeText);
        const ilTree = this.nest(codeTree);
        return ilTree;
    }
    tokenize(code) {
        const lexList = [];
        const pushSymbol = (symbol) => {
            if (symbol === "")
                return;
            if (this.isTextNumber(symbol)) {
                const number = this.parseNumber(symbol);
                lexList.push(number);
            }
            else {
                lexList.push(symbol);
            }
        };
        for (let i = 0, symbol = ""; i < code.length; i++) {
            const ch = code[i];
            if (ch === '"') {
                const charList = [];
                for (i++; i < code.length; i++) {
                    const c = code[i];
                    if (c === '"' && i < code.length - 1 && code[i + 1] === '"') {
                        charList.push('"');
                        i++;
                        continue;
                    }
                    else if (c === '"') {
                        break;
                    }
                    charList.push(c);
                }
                const str = charList.join("");
                lexList.push("(", "string", str, ")");
                continue;
            }
            if (this.isLineComment(ch)) {
                for (; i < code.length; i++) {
                    const c = code[i];
                    if (this.isEndOfLine(c)) {
                        break;
                    }
                }
                continue;
            }
            if (this.isParen(ch)) {
                pushSymbol(symbol);
                symbol = "";
                lexList.push(ch);
                if (ch === "[") {
                    lexList.push("list");
                }
                continue;
            }
            if (this.isWhiteSpace(ch)) {
                pushSymbol(symbol);
                symbol = "";
                continue;
            }
            symbol += ch;
            if (i === code.length - 1) {
                pushSymbol(symbol);
                symbol = "";
            }
        }
        return lexList;
    }
    nest(tree) {
        let i = -1;
        function pass(list) {
            if (++i === tree.length)
                return list;
            const token = tree[i];
            if (["{", "[", "("].indexOf(token) > -1) {
                return list.concat([pass([])]).concat(pass([]));
            }
            if ([")", "]", "}"].indexOf(token) > -1) {
                return list;
            }
            return pass(list.concat(token));
        }
        return pass([]);
    }
    isParen(ch) {
        return this.isOpenParen(ch) || this.isCloseParen(ch);
    }
    isOpenParen(ch) {
        return this.openParenChars.indexOf(ch) > -1;
    }
    isCloseParen(ch) {
        return this.closeParenChars.indexOf(ch) > -1;
    }
    isWhiteSpace(ch) {
        return this.whiteSpaceChars.indexOf(ch) > -1 ||
            this.endOfLineChars.indexOf(ch) > -1;
    }
    isLineComment(ch) {
        return this.commentStartChars.indexOf(ch) > -1;
    }
    isEndOfLine(ch) {
        return this.endOfLineChars.indexOf(ch) > -1;
    }
    isTextNumber(text) {
        return this.numberRegExp.test(text);
    }
    parseNumber(numberText) {
        const isNegative = numberText[0] === "-";
        const cleanedNumbText = numberText.replace(/-/g, "");
        const parsedNumber = Number(cleanedNumbText);
        const number = isNegative ? -parsedNumber : parsedNumber;
        return number;
    }
}
if (typeof module === "object") {
    module.exports.Parser = Parser;
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
        const parser = new Parser();
        return parser.parse(codeText);
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
            case "list.concat": return this.listConcat(expr, env);
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
        const lst = this.inter.evalExpr(expr[1], env);
        const elm = this.inter.evalExpr(expr[2], env);
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
    listConcat(expr, env) {
        const lst1 = this.inter.evalExpr(expr[1], env);
        const lst2 = this.inter.evalExpr(expr[2], env);
        return Array.isArray(lst1) ? lst1.concat(lst2) : lst1;
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
    listIsList(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst);
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
    listLeast(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 1 ? lst.slice(0, lst.length - 1) : [];
    }
    listLength(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) ? lst.length : -1;
    }
    listPush(expr, env, pure = true) {
        const lst = this.inter.evalExpr(expr[1], env);
        const elm = this.inter.evalExpr(expr[2], env);
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
        const lst = this.inter.evalExpr(expr[1], env);
        const elm = this.inter.evalExpr(expr[2], env);
        const index = this.inter.evalExpr(expr[3], env);
        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            const list = pure ? lst.slice() : lst;
            list[index] = elm;
            return list;
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
            case "numb.finite?": return this.evalIsFinite(expr, env);
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
    evalIsFinite(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        return typeof value === "number" && isFinite(value);
    }
    evalIsInteger(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    }
    evalParseFloat(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        const res = parseFloat(value);
        if (isNaN(res))
            throw "Not a number: " + value;
        return res;
    }
    evalParseInt(expr, env) {
        const value = this.inter.evalExpr(expr[1], env);
        const res = parseInt(value);
        if (isNaN(res))
            throw "Not a number: " + value;
        return res;
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
        return value.toString();
    }
}
class StringLib {
    constructor(interpreter) {
        this.inter = interpreter;
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "str.length": return this.strLength(expr, env);
            case "str.has?": return this.strHas(expr, env);
            case "str.split": return this.strSplit(expr, env);
            case "str.to-lowercase": return this.strToLowercase(expr, env);
            case "str.to-uppercase": return this.strToUppercase(expr, env);
        }
        return "##not-resolved##";
    }
    strLength(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string")
            throw Error("Not a string: " + str);
        return str.length;
    }
    strHas(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        const elem = this.inter.evalExpr(expr[2], env);
        if (typeof str !== "string")
            throw Error("Not a string: " + str);
        if (typeof elem !== "string")
            throw Error("Not a string: " + elem);
        return str.includes(elem);
    }
    strSplit(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string")
            throw Error("Not a string: " + str);
        if (expr.length === 2)
            return str.split("");
        const sep = this.inter.evalExpr(expr[2], env);
        if (typeof sep !== "string")
            throw Error("Not a string: " + sep);
        return str.split(sep);
    }
    strToLowercase(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string")
            throw Error("Not a string: " + str);
        return str.toLowerCase();
    }
    strToUppercase(expr, env) {
        const str = this.inter.evalExpr(expr[1], env);
        if (typeof str !== "string")
            throw Error("Not a string: " + str);
        return str.toUpperCase();
    }
}
