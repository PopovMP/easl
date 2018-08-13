"use strict";
class Easl {
    constructor() {
        this.interpreter = new Interpreter();
    }
    evaluate(codeText) {
        const codeTree = Parser.parse(codeText);
        const output = this.interpreter.evalCodeTree(codeTree);
        return output;
    }
}
module.exports.Easl = Easl;
class Interpreter {
    constructor() {
        this.isDebug = false;
        this.isNull = (a) => a === null || a === "null" || a === "" || this.isEmptyList(a);
        this.isNumber = (a) => typeof a === "number";
        this.isString = (a) => typeof a === "string";
        this.isBoolean = (a) => typeof a === "boolean";
        this.isProcedure = (a) => typeof a === "function";
        this.isUndefined = (a) => typeof a === "undefined";
        this.isSymbol = (a) => typeof a === "symbol";
        this.not = (a) => this.isEmptyList(a) || !a;
        this.isList = (a) => Array.isArray(a);
        this.isEmptyList = (a) => Array.isArray(a) && a.length === 0;
        this.car = (lst) => lst[0];
        this.cdr = (lst) => lst.slice(1);
        this.caar = (lst) => this.car(this.car(lst));
        this.cadr = (lst) => this.car(this.cdr(lst));
        this.cdar = (lst) => this.cdr(this.car(lst));
        this.cddr = (lst) => this.cdr(this.cdr(lst));
        this.caaar = (lst) => this.car(this.car(this.car(lst)));
        this.caadr = (lst) => this.car(this.car(this.cdr(lst)));
        this.cadar = (lst) => this.car(this.cdr(this.car(lst)));
        this.caddr = (lst) => this.car(this.cdr(this.cdr(lst)));
        this.cddar = (lst) => this.cdr(this.cdr(this.car(lst)));
        this.cdddr = (lst) => this.cdr(this.cdr(this.cdr(lst)));
        this.cons = (a, b) => {
            if (b === null)
                return [a];
            if (this.isList(b))
                return b.unshift(a) && b;
            return [a, b];
        };
        this.length = (lst) => lst.length;
        this.isPair = (lst) => Array.isArray(lst) && lst.length > 0;
    }
    evalCodeTree(codeTree) {
        return this.evalExprLst(codeTree, ["empty-env"]);
    }
    evalExprLst(exprLst, env) {
        const newEnv = this.assocDefines(exprLst, env);
        const res = this.mapExprLst(exprLst, newEnv);
        return res[res.length - 1];
    }
    mapExprLst(exprLst, env) {
        return exprLst.map((expr) => this.evalExpr(expr, env), exprLst);
    }
    assocDefines(exprLst, env) {
        const newEnv = env.slice();
        for (const expr of exprLst) {
            if (Array.isArray(expr) && expr[0] === "define") {
                newEnv.unshift(this.manageDefine(expr, newEnv));
            }
        }
        return newEnv;
    }
    manageDefine(expr, env) {
        if (typeof (expr[1]) === "string") {
            return [expr[1], this.evalExpr(expr[2], env)];
        }
        if (Array.isArray([expr[1]])) {
            const procId = expr[1][0];
            const procParams = expr[1].slice(1);
            const procBody = expr.slice(2);
            return [procId, ["closure", procParams, procBody, env.slice()]];
        }
        return env;
    }
    lookup(symbol, env) {
        if (this.isDebug)
            console.log("lookup symbol:", JSON.stringify(symbol), "env:", JSON.stringify(env));
        if (this.not(this.isPair(env))) {
            new Error(`lookup unbound symbol: ${JSON.stringify(symbol)}`);
            return [];
        }
        if (env[0] === "letrec-env") {
            const proc = this.getPair(symbol, env[1]);
            if (proc[0] === symbol) {
                const closure = ["closure", proc[2], proc[3], env];
                if (this.isDebug)
                    console.log("lookup closure found:", JSON.stringify(symbol), "value:", JSON.stringify(closure));
                return closure;
            }
            else {
                return this.lookup(symbol, env[2]);
            }
        }
        if (env[0] === "let-proc") {
            if (env[1] === symbol) {
                const closure = ["closure", env[2], env[3], env];
                if (this.isDebug)
                    console.log("lookup closure found:", JSON.stringify(symbol), "value:", JSON.stringify(closure));
                return closure;
            }
            else {
                return this.lookup(symbol, env[4]);
            }
        }
        if (symbol === env[0][0]) {
            const val = env[0][1];
            if (this.isDebug)
                console.log("lookup symbol found:", JSON.stringify(symbol), "value:", JSON.stringify(val));
            return val;
        }
        return this.lookup(symbol, env.slice(1));
    }
    evalExpr(expr, env) {
        if (this.isDebug)
            console.log("evalExpr expr:", JSON.stringify(expr), "env:", JSON.stringify(env));
        if (expr === "null")
            return null;
        if (expr === "true")
            return true;
        if (expr === "false")
            return false;
        if (this.isNumber(expr))
            return expr;
        if (this.isNull(expr))
            return expr;
        if (this.isBoolean(expr))
            return expr;
        if (this.isProcedure(expr))
            return expr;
        if (this.isUndefined(expr))
            return expr;
        if (this.isSymbol(expr))
            return expr;
        if (this.isString(expr)) {
            const val = this.lookup(expr, env);
            if (typeof val === "undefined") {
                new Error(`lookup returns 'undefined' for symbol: ${JSON.stringify(expr)}`);
            }
            return val;
        }
        switch (expr[0]) {
            case "eq?": return this.evalExpr(expr[1], env) === this.evalExpr(expr[2], env);
            case "boolean?": return this.isBoolean(this.evalExpr(expr[1], env));
            case "null?": return this.isNull(this.evalExpr(expr[1], env));
            case "number?": return this.isNumber(this.evalExpr(expr[1], env));
            case "string?": return this.isString(this.evalExpr(expr[1], env));
            case "symbol?": return this.isSymbol(this.evalExpr(expr[1], env));
            case "pair?": return this.isPair(this.evalExpr(expr[1], env));
            case "list?": return this.isList(this.evalExpr(expr[1], env));
            case "zero?": return this.evalExpr(expr[1], env) === 0;
            case "add1": return this.evalExpr(expr[1], env) + 1;
            case "sub1": return this.evalExpr(expr[1], env) - 1;
            case "+": return this.evalExpr(expr[1], env) + this.evalExpr(expr[2], env);
            case "-": return this.evalExpr(expr[1], env) - this.evalExpr(expr[2], env);
            case "*": return this.evalExpr(expr[1], env) * this.evalExpr(expr[2], env);
            case "/": return this.evalExpr(expr[1], env) / this.evalExpr(expr[2], env);
            case "=": return this.evalExpr(expr[1], env) === this.evalExpr(expr[2], env);
            case ">": return this.evalExpr(expr[1], env) > this.evalExpr(expr[2], env);
            case "<": return this.evalExpr(expr[1], env) < this.evalExpr(expr[2], env);
            case "!=": return this.evalExpr(expr[1], env) !== this.evalExpr(expr[2], env);
            case ">=": return this.evalExpr(expr[1], env) >= this.evalExpr(expr[2], env);
            case "<=": return this.evalExpr(expr[1], env) <= this.evalExpr(expr[2], env);
            case "and": return this.evalExpr(expr[1], env) && this.evalExpr(expr[2], env);
            case "or": return this.evalExpr(expr[1], env) || this.evalExpr(expr[2], env);
            case "not": return this.not(this.evalExpr(expr[1], env));
            case "list": return this.mapExprLst(expr.slice(1), env);
            case "length": return this.length(expr[1]);
            case "cons": return this.evalCons(expr.slice(1), env);
            case "car": return this.car(this.evalExpr(expr[1], env));
            case "cdr": return this.cdr(this.evalExpr(expr[1], env));
            case "caar": return this.caar(this.evalExpr(expr[1], env));
            case "cadr": return this.cadr(this.evalExpr(expr[1], env));
            case "cdar": return this.cdar(this.evalExpr(expr[1], env));
            case "cddr": return this.cddr(this.evalExpr(expr[1], env));
            case "caaar": return this.caaar(this.evalExpr(expr[1], env));
            case "caadr": return this.caadr(this.evalExpr(expr[1], env));
            case "cadar": return this.cadar(this.evalExpr(expr[1], env));
            case "caddr": return this.caddr(this.evalExpr(expr[1], env));
            case "cddar": return this.cddar(this.evalExpr(expr[1], env));
            case "cdddr": return this.cdddr(this.evalExpr(expr[1], env));
            case "list.empty": return [];
            case "list.length": return this.listLength(expr, env);
            case "list.first": return this.listFirst(expr, env);
            case "list.rest": return this.listRest(expr, env);
            case "list.last": return this.listLast(expr, env);
            case "list.least": return this.listLeast(expr, env);
            case "list.add": return this.listAdd(expr, env);
            case "list.push": return this.listPush(expr, env);
            case "list.index": return this.listIndex(expr, env);
            case "list.has": return this.listHas(expr, env);
            case "list.get": return this.listGet(expr, env);
            case "list.set": return this.listSet(expr, env);
            case "list.swap": return this.listSwap(expr, env);
            case "list.append": return this.listAppend(expr, env);
            case "list.slice": return this.listSlice(expr, env);
            case "list.flatten": return this.listFlatten(expr, env);
            case "list.join": return this.listJoin(expr, env);
            case "print": return console.log(this.evalExpr(expr[1], env).toString());
            case "if": return this.isTruthy(this.evalExpr(expr[1], env))
                ? this.evalExpr(expr[2], env)
                : this.evalExpr(expr[3], env);
            case "define": return;
            case "cond": return this.evalCond(expr, env);
            case "begin": return this.evalExprLst(this.cdr(expr), env);
            case "for": return this.evalFor(expr, env);
            case "lambda": return ["closure", expr[1], expr[2], env.slice()];
            case "let": return this.evalLet(expr, env);
            case "let*": return this.evalLetStar(expr, env);
            case "letrec": return this.evalLetRec(expr, env);
        }
        return this.applyProcedure(this.evalExpr(expr[0], env), this.mapExprLst(expr.slice(1), env));
    }
    applyProcedure(proc, argsList) {
        if (this.isDebug) {
            console.log("applProc proc:", JSON.stringify(proc));
            console.log("applProc args:", JSON.stringify(argsList));
        }
        if (this.isPair(proc) && proc[0] === "closure") {
            const paramsList = proc[1];
            const exprList = proc[2];
            const closureEnv = proc[3];
            const exprEnv = this.assocList(paramsList, argsList).concat(closureEnv);
            return this.evalExpr(exprList, exprEnv);
        }
        return proc;
    }
    isTruthy(expr) {
        return !this.isFaulty(expr);
    }
    isFaulty(expr) {
        if (Array.isArray(expr) && expr.length === 0)
            return true;
        return !expr;
    }
    getPair(symb, alist) {
        for (let i = 0; i < alist.length; i++) {
            if (alist[i][0] === symb)
                return alist[i];
        }
        console.error("#getPair: \"Pair doesn't found!\"  symbol:", JSON.stringify(symb), "alist:", JSON.stringify(alist));
        return [];
    }
    assocList(lst1, lst2) {
        const aList = [];
        for (let i = 0; i < lst1.length; i++) {
            aList.push([lst1[i], lst2[i]]);
        }
        return aList;
    }
    evalCons(argsLst, env) {
        const a = this.evalExpr(argsLst[0], env);
        const b = this.evalExpr(argsLst.slice(1), env);
        return this.cons(a, b);
    }
    evalCond(expr, env) {
        return this.evalCondLoop(expr.slice(1), env);
    }
    evalCondLoop(condClauses, env) {
        const clause = condClauses[0];
        if (clause[0] === "else") {
            return this.evalExprLst(clause.slice(1), env);
        }
        else {
            if (this.evalExpr(clause[0], env)) {
                return this.evalExprLst(clause.slice(1), env);
            }
            else {
                return this.evalCondLoop(condClauses.slice(1), env);
            }
        }
    }
    evalFor(expr, env) {
        const counterPair = [expr[1][0], expr[1][1]];
        const getNewEnv = (e, c) => {
            e.unshift(c);
            return e;
        };
        let lastRes;
        for (; this.evalExpr(expr[2].slice(), getNewEnv(env, counterPair)); counterPair[1] = this.evalExpr(expr[3].slice(), getNewEnv(env, counterPair))) {
            lastRes = this.evalExprLst(expr.slice(4), getNewEnv(env, counterPair));
        }
        return lastRes;
    }
    evalLet(expr, env) {
        if (this.isString(expr[1])) {
            return this.evalLetProc(expr, env);
        }
        else {
            return this.evalExprLst(expr.slice(2), this.assocLetArgs(expr[1], env));
        }
    }
    evalLetStar(expr, env) {
        return this.evalExprLst(expr.slice(2), this.assocLetStarArgs(expr[1], env));
    }
    evalLetProc(expr, env) {
        const procId = expr[1];
        const procParams = expr[2].map((pair) => pair[0]);
        const bodyExpr = expr.slice(3);
        const assocEnv = this.assocLetArgs(expr[2], env);
        return this.evalExpr(bodyExpr, ["let-proc", procId, procParams, bodyExpr, assocEnv]);
    }
    assocLetArgs(argsList, env) {
        return this.assocLetArgsLoop(argsList, env, env);
    }
    assocLetArgsLoop(argsList, env, letEnv) {
        if (argsList.length === 0) {
            return letEnv.slice();
        }
        else {
            return this.assocLetArgsLoop(argsList.slice(1), env, this.evalLetArgPair(argsList[0], env).concat(letEnv));
        }
    }
    assocLetStarArgs(argsList, env) {
        return this.assocLetStarArgsLoop(argsList, env);
    }
    assocLetStarArgsLoop(argsList, letEnv) {
        if (argsList.length === 0) {
            return letEnv.slice();
        }
        else {
            return this.assocLetStarArgsLoop(argsList.slice(1), this.evalLetArgPair(argsList[0], letEnv).concat(letEnv));
        }
    }
    evalLetArgPair(argPair, env) {
        const key = argPair[0];
        const val = this.evalExpr(argPair[1], env);
        return [[key, val]];
    }
    evalLetRec(expr, env) {
        const procBinds = expr[1].map((e) => [e[0], "letrec-proc", e[1][1], e[1].slice(2)], expr[1]);
        return this.evalExpr(expr.slice(2), ["letrec-env", procBinds, env.slice()]);
    }
    listLength(expr, env) {
        const lst = this.evalExpr(expr[1], env);
        return Array.isArray(lst) ? lst.length : -1;
    }
    listFirst(expr, env) {
        const lst = this.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 0 ? lst[0] : null;
    }
    listLast(expr, env) {
        const lst = this.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 0 ? lst[lst.length - 1] : null;
    }
    listRest(expr, env) {
        const lst = this.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 1 ? lst.slice(1) : [];
    }
    listLeast(expr, env) {
        const lst = this.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 1 ? lst.slice(0, lst.length - 1) : [];
    }
    listAdd(expr, env) {
        const elm = this.evalExpr(expr[1], env);
        const lst = this.evalExpr(expr[2], env);
        if (Array.isArray(lst)) {
            lst.push(elm);
            return lst;
        }
        if (lst === null) {
            return [elm];
        }
        return [lst, elm];
    }
    listPush(expr, env) {
        const elm = this.evalExpr(expr[1], env);
        const lst = this.evalExpr(expr[2], env);
        if (Array.isArray(lst)) {
            lst.unshift(elm);
            return lst;
        }
        if (lst === null) {
            return [elm];
        }
        return [elm, lst];
    }
    listIndex(expr, env) {
        const elm = this.evalExpr(expr[1], env);
        const lst = this.evalExpr(expr[2], env);
        if (Array.isArray(lst)) {
            return lst.indexOf(elm);
        }
        return -1;
    }
    listHas(expr, env) {
        return this.listIndex(expr, env) > -1;
    }
    listGet(expr, env) {
        const index = this.evalExpr(expr[1], env);
        const lst = this.evalExpr(expr[2], env);
        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            return lst[index];
        }
        return null;
    }
    listSet(expr, env) {
        const elm = this.evalExpr(expr[1], env);
        const index = this.evalExpr(expr[2], env);
        const lst = this.evalExpr(expr[3], env);
        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            const newLst = lst.slice();
            newLst[index] = elm;
            return newLst;
        }
        return lst;
    }
    listSwap(expr, env) {
        const i1 = this.evalExpr(expr[1], env);
        const i2 = this.evalExpr(expr[2], env);
        const lst = this.evalExpr(expr[3], env);
        if (Array.isArray(lst) && i1 >= 0 && i1 < lst.length && i2 >= 0 && i2 < lst.length) {
            const newLst = lst.slice();
            newLst[i1] = lst[i2];
            newLst[i2] = lst[i1];
            return newLst;
        }
        return [];
    }
    listAppend(expr, env) {
        const lst1 = this.evalExpr(expr[1], env);
        const lst2 = this.evalExpr(expr[2], env);
        return Array.isArray(lst2) ? lst2.concat(lst1) : lst1;
    }
    listSlice(expr, env) {
        const from = this.evalExpr(expr[1], env);
        const to = this.evalExpr(expr[2], env);
        const lst = this.evalExpr(expr[3], env);
        return lst.slice(from, to);
    }
    listFlatten(expr, env) {
        const lst = this.evalExpr(expr[1], env);
        return this.flattenArray(lst);
    }
    listJoin(expr, env) {
        const sep = expr[1];
        const lst = this.evalExpr(expr[2], env);
        return lst.join(sep);
    }
    flattenArray(arr) {
        return arr.reduce((flat, toFlatten) => flat.concat(Array.isArray(toFlatten)
            ? this.flattenArray(toFlatten)
            : toFlatten), []);
    }
}
class Parser {
    static parse(codeText) {
        const lexTree = Parser.lexer(codeText);
        const quotedLexTree = Parser.quoteSymbols(lexTree);
        const fixedLexTree = Parser.replaceParens(quotedLexTree);
        const joinedLexTree = Parser.joinLexTree(fixedLexTree);
        const codeTree = Parser.tokenize(joinedLexTree);
        return codeTree;
    }
    static lexer(code) {
        const lexList = [];
        for (let i = 0, symbol = ""; i < code.length; i++) {
            const c = code[i];
            const pushSymbol = () => {
                if (symbol === "")
                    return;
                lexList.push(symbol);
                symbol = "";
            };
            if (Parser.isDelimiter(c)) {
                pushSymbol();
                lexList.push(c);
            }
            else if (Parser.isWhiteSpace(c)) {
                pushSymbol();
            }
            else {
                symbol += c;
                if (i === code.length - 1) {
                    pushSymbol();
                }
            }
        }
        return lexList;
    }
    static quoteSymbols(lexTree) {
        const result = [];
        for (let i = 0; i < lexTree.length; i++) {
            const token = lexTree[i];
            if (Parser.isNumber(token)) {
                result.push(token);
            }
            else if (Parser.isDelimiter(token)) {
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
                    result.push("[");
                    break;
                case "[":
                    result.push("[");
                    result.push("\"list\"");
                    break;
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
                for (; i < lexTree.length && lexTree[i] === "["; i++) {
                    parens += lexTree[i];
                }
                result.push(parens += lexTree[i]);
            }
            else if (lexTree[i] === "]") {
                let parens = "";
                for (; i < lexTree.length && lexTree[i] === "]"; i++) {
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
    static isDelimiter(ch) {
        return Parser.isOpenDelimiter(ch) || Parser.isCloseDelimiter(ch);
    }
    static isOpenDelimiter(ch) {
        return ["(", "[", "{"].indexOf(ch) > -1;
    }
    static isCloseDelimiter(ch) {
        return [")", "]", "}"].indexOf(ch) > -1;
    }
    static isDigit(ch) {
        return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(ch) > -1;
    }
    static isWhiteSpace(ch) {
        return [" ", "\t", "\r", "\n"].indexOf(ch) > -1;
    }
    static isNumber(text) {
        if (text === "")
            return false;
        if (!Parser.isDigit(text[0]) && text[0] !== "-")
            return false;
        if (text[0] === "-" && text.length === 1)
            return false;
        for (let i = 1; i < text.length; i++) {
            if (!Parser.isDigit(text[i]) && text[i] !== ".")
                return false;
        }
        return true;
    }
}
module.exports.Parser = Parser;
