"use strict";
class Easl {
    constructor() {
        this.interpreter = new Interpreter();
    }
    evaluate(codeText, optionsParam) {
        const options = optionsParam
            ? Options.parse(optionsParam)
            : new Options();
        try {
            const codeTree = Parser.parse(codeText);
            const output = this.interpreter.evalCodeTree(codeTree, options);
            return output;
        }
        catch (e) {
            return e.toString();
        }
    }
}
if (typeof module === "object") {
    module.exports.Easl = Easl;
}
class Interpreter {
    constructor() {
        this.print = console.log;
        this.isDebug = false;
        this.libs = [];
        this.libs.push(new SchemeLib(this));
        this.libs.push(new ListLib(this));
        this.libs.push(new StringLib(this));
        this.libs.push(new MathLib(this));
        this.libs.push(new NumberLib(this));
    }
    evalCodeTree(codeTree, options) {
        this.print = options.print;
        this.isDebug = options.isDebug;
        return this.evalExprLst(codeTree, []);
    }
    evalExprLst(exprLst, env) {
        let res;
        for (const expr of exprLst) {
            res = this.evalExpr(expr, env);
        }
        return res;
    }
    mapExprLst(exprLst, env) {
        return exprLst.map((expr) => this.evalExpr(expr, env), exprLst);
    }
    lookup(symbol, env) {
        for (const cell of env) {
            if (this.isDebug)
                console.log("lookup symbol:", JSON.stringify(symbol), "cell:", JSON.stringify(cell));
            if (symbol === cell[0]) {
                const val = cell[1];
                if (this.isDebug)
                    console.log("lookup found :", JSON.stringify(symbol), "value:", JSON.stringify(val));
                return val;
            }
        }
        throw Error(`lookup unbound symbol: ${JSON.stringify(symbol)}`);
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
        if (typeof expr === "number")
            return expr;
        if (typeof expr === "string")
            return this.lookup(expr, env);
        switch (expr[0]) {
            case "list": return this.mapExprLst(expr.slice(1), env);
            case "string": return expr[1];
            case "let": return this.evalLet(expr, env);
            case "lambda": return this.evalLambda(expr, env);
            case "function": return this.evalFunction(expr, env);
            case "if": return this.evalIf(expr, env);
            case "cond": return this.evalCond(expr, env);
            case "begin": return this.evalExprLst(expr.slice(1), env);
            case "for": return this.evalFor(expr, env);
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
            case "not": return this.evalNot(this.evalExpr(expr[1], env));
            case "type-of": return this.evalTypeOf(expr[1], env);
            case "to-string": return String(this.evalExpr(expr[1], env));
            case "to-number": return this.toNumber(this.evalExpr(expr[1], env));
            case "to-boolean": return this.toBoolean(this.evalExpr(expr[1], env));
            case "print": return this.print(String(this.mapExprLst(expr.slice(1), env).join(" "))) || "";
        }
        const res = this.resolveThroughLib(expr, env);
        if (res !== "##not-resolved##")
            return res;
        if (Array.isArray(expr)) {
            const proc = this.evalExpr(expr[0], env);
            const args = (expr.length > 1) ? this.mapExprLst(expr.slice(1), env) : [];
            return this.applyProcedure(proc, args, env);
        }
        else {
            throw Error(`evalExpr - not proc reached the end: ${expr}`);
        }
    }
    applyProcedure(proc, procArgs, env) {
        if (this.isDebug) {
            console.log("applProc proc:", JSON.stringify(proc));
            console.log("applProc args:", JSON.stringify(procArgs));
        }
        if (Array.isArray(proc) && proc[0] === "closure") {
            const closureEnv = this.assocList(proc[1], procArgs).concat(env).concat(proc[3]);
            const closureBody = proc[2];
            return this.evalExpr(closureBody, closureEnv);
        }
        return proc;
    }
    assocList(lst1, lst2) {
        const aList = [];
        for (let i = 0; i < lst1.length; i++) {
            aList.push([lst1[i], lst2[i]]);
        }
        return aList;
    }
    evalLambda(expr, env) {
        return ["closure", expr[1], expr[2], env.slice()];
    }
    evalLet(expr, env) {
        const symbol = expr[1];
        const body = expr[2];
        const value = (Array.isArray(body) && body[0] === "lambda")
            ? this.evalLambda(["lambda", body[1], body[2]], env)
            : this.evalExpr(body, env);
        env.unshift([symbol, value]);
        return value;
    }
    evalFunction(expr, env) {
        const length = expr.length;
        const symbol = expr[1];
        const params = length > 3 ? expr[2] : [];
        const body = length > 4 ? ["begin", ...expr.slice(3)] : expr[length - 1];
        const value = this.evalLambda(["lambda", params, body], env);
        env.unshift([symbol, value]);
        return value;
    }
    evalIf(expr, env) {
        const value = this.isTruthy(this.evalExpr(expr[1], env))
            ? this.evalExpr(expr[2], env)
            : this.evalExpr(expr[3], env);
        return value;
    }
    isTruthy(expr) {
        return !this.isFaulty(expr);
    }
    isFaulty(expr) {
        if (Array.isArray(expr) && expr.length === 0)
            return true;
        return !expr;
    }
    evalCond(expr, env) {
        return this.evalCondLoop(expr.slice(1), env);
    }
    evalCondLoop(condClauses, env) {
        const clause = condClauses[0];
        if (clause[0] === "else") {
            return this.evalExprLst(clause.slice(1), env);
        }
        if (this.evalExpr(clause[0], env)) {
            return this.evalExprLst(clause.slice(1), env);
        }
        return this.evalCondLoop(condClauses.slice(1), env);
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
    evalTypeOf(expr, env) {
        if (Array.isArray(expr)) {
            switch (expr[0]) {
                case "list": return "list";
                case "string": return "string";
                case "lambda":
                case "function":
                case "closure": return "function";
            }
        }
        if (expr === "null")
            return "null";
        const value = this.evalExpr(expr, env);
        if (Array.isArray(value)) {
            switch (value[0]) {
                case "lambda":
                case "function":
                case "closure": return "function";
            }
        }
        return typeof value;
    }
    evalNot(a) {
        return (Array.isArray(a) && a.length === 0) || !a;
    }
    toBoolean(a) {
        return !this.evalNot(a);
    }
    toNumber(a) {
        const number = Number(a);
        return Number.isNaN(number) ? null : number;
    }
    ;
    resolveThroughLib(expr, env) {
        for (const lib of this.libs) {
            const res = lib.eval(expr, env);
            if (res !== "##not-resolved##")
                return res;
        }
        return "##not-resolved##";
    }
}
class Options {
    constructor() {
        this.print = console.log;
        this.isDebug = false;
    }
    static parse(options) {
        const evalOptions = new Options();
        if (typeof options.print === "function") {
            evalOptions.print = options.print;
        }
        if (typeof options.isDebug === "boolean") {
            evalOptions.isDebug = options.isDebug;
        }
        return evalOptions;
    }
}
class ListLib {
    constructor(interpreter) {
        this.inter = interpreter;
    }
    eval(expr, env) {
        switch (expr[0]) {
            case "list.empty": return [];
            case "list.empty?": return this.listEmpty(expr, env);
            case "list.length": return this.listLength(expr, env);
            case "list.first": return this.listFirst(expr, env);
            case "list.rest": return this.listRest(expr, env);
            case "list.last": return this.listLast(expr, env);
            case "list.least": return this.listLeast(expr, env);
            case "list.add": return this.listAdd(expr, env);
            case "list.push": return this.listPush(expr, env);
            case "list.index": return this.listIndex(expr, env);
            case "list.has?": return this.listHas(expr, env);
            case "list.get": return this.listGet(expr, env);
            case "list.set": return this.listSet(expr, env);
            case "list.swap": return this.listSwap(expr, env);
            case "list.append": return this.listAppend(expr, env);
            case "list.slice": return this.listSlice(expr, env);
            case "list.flatten": return this.listFlatten(expr, env);
            case "list.join": return this.listJoin(expr, env);
        }
        return "##not-resolved##";
    }
    listEmpty(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) ? lst.length === 0 : true;
    }
    listLength(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) ? lst.length : -1;
    }
    listFirst(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 0 ? lst[0] : null;
    }
    listLast(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 0 ? lst[lst.length - 1] : null;
    }
    listRest(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 1 ? lst.slice(1) : [];
    }
    listLeast(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return Array.isArray(lst) && lst.length > 1 ? lst.slice(0, lst.length - 1) : [];
    }
    listAdd(expr, env) {
        const elm = this.inter.evalExpr(expr[1], env);
        const lst = this.inter.evalExpr(expr[2], env);
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
        const elm = this.inter.evalExpr(expr[1], env);
        const lst = this.inter.evalExpr(expr[2], env);
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
        const elm = this.inter.evalExpr(expr[1], env);
        const lst = this.inter.evalExpr(expr[2], env);
        if (Array.isArray(lst)) {
            return lst.indexOf(elm);
        }
        return -1;
    }
    listHas(expr, env) {
        return this.listIndex(expr, env) > -1;
    }
    listGet(expr, env) {
        const index = this.inter.evalExpr(expr[1], env);
        const lst = this.inter.evalExpr(expr[2], env);
        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            return lst[index];
        }
        return null;
    }
    listSet(expr, env) {
        const elm = this.inter.evalExpr(expr[1], env);
        const index = this.inter.evalExpr(expr[2], env);
        const lst = this.inter.evalExpr(expr[3], env);
        if (Array.isArray(lst) && index >= 0 && index < lst.length) {
            const newLst = lst.slice();
            newLst[index] = elm;
            return newLst;
        }
        return lst;
    }
    listSwap(expr, env) {
        const i1 = this.inter.evalExpr(expr[1], env);
        const i2 = this.inter.evalExpr(expr[2], env);
        const lst = this.inter.evalExpr(expr[3], env);
        if (Array.isArray(lst) && i1 >= 0 && i1 < lst.length && i2 >= 0 && i2 < lst.length) {
            const newLst = lst.slice();
            newLst[i1] = lst[i2];
            newLst[i2] = lst[i1];
            return newLst;
        }
        return [];
    }
    listAppend(expr, env) {
        const lst1 = this.inter.evalExpr(expr[1], env);
        const lst2 = this.inter.evalExpr(expr[2], env);
        return Array.isArray(lst2) ? lst2.concat(lst1) : lst1;
    }
    listSlice(expr, env) {
        const from = this.inter.evalExpr(expr[1], env);
        const to = this.inter.evalExpr(expr[2], env);
        const lst = this.inter.evalExpr(expr[3], env);
        return lst.slice(from, to);
    }
    listFlatten(expr, env) {
        const lst = this.inter.evalExpr(expr[1], env);
        return this.flattenArray(lst);
    }
    listJoin(expr, env) {
        const sep = expr[1];
        const lst = this.inter.evalExpr(expr[2], env);
        return lst.join(sep);
    }
    flattenArray(arr) {
        return arr.reduce((flat, toFlatten) => flat.concat(Array.isArray(toFlatten)
            ? this.flattenArray(toFlatten)
            : toFlatten), []);
    }
}
class MathLib {
    constructor(interpreter) {
        this.inter = interpreter;
    }
    eval(expr, env) {
        switch (expr[0]) {
            case "math.pi": return Math.PI;
            case "math.abs": return Math.abs(this.inter.evalExpr(expr[1], env));
            case "math.ceil": return Math.ceil(this.inter.evalExpr(expr[1], env));
            case "math.floor": return Math.floor(this.inter.evalExpr(expr[1], env));
            case "math.log10": return Math.log10(this.inter.evalExpr(expr[1], env));
            case "math.max": return Math.max(this.inter.evalExpr(expr[1], env), this.inter.evalExpr(expr[2], env));
            case "math.min": return Math.min(this.inter.evalExpr(expr[1], env), this.inter.evalExpr(expr[2], env));
            case "math.pow": return Math.pow(this.inter.evalExpr(expr[1], env), this.inter.evalExpr(expr[2], env));
            case "math.random": return Math.random();
            case "math.round": return Math.round(this.inter.evalExpr(expr[1], env));
            case "math.sign": return Math.sign(this.inter.evalExpr(expr[1], env));
            case "math.sqrt": return Math.sqrt(this.inter.evalExpr(expr[1], env));
            case "math.trunc": return Math.trunc(this.inter.evalExpr(expr[1], env));
        }
        return "##not-resolved##";
    }
}
class NumberLib {
    constructor(interpreter) {
        this.inter = interpreter;
    }
    eval(expr, env) {
        switch (expr[0]) {
            case "numb.epsilon": return Number.EPSILON;
            case "numb.max-value": return Number.MAX_VALUE;
            case "numb.min-value": return Number.MIN_VALUE;
            case "numb.is-integer": return Number.isInteger(this.inter.evalExpr(expr[1], env));
            case "numb.parse-float": return Number.parseFloat(this.inter.evalExpr(expr[1], env));
            case "numb.parse-integer": return Number.parseInt(this.inter.evalExpr(expr[1], env));
            case "numb.to-fixed": return (this.inter.evalExpr(expr[1], env)).toFixed(this.inter.evalExpr(expr[1], env));
            case "numb.to-string": return (this.inter.evalExpr(expr[1], env)).toString(10);
        }
        return "##not-resolved##";
    }
}
class SchemeLib {
    constructor(interpreter) {
        this.isNull = (a) => a === null;
        this.isNumber = (a) => typeof a === "number";
        this.isString = (a) => typeof a === "string";
        this.isBoolean = (a) => typeof a === "boolean";
        this.isList = (a) => Array.isArray(a);
        this.isPair = (lst) => Array.isArray(lst) && lst.length > 0;
        this.length = (lst) => Array.isArray(lst) ? lst.length : -1;
        this.car = (lst) => lst[0];
        this.cdr = (lst) => lst.slice(1);
        this.caar = (lst) => this.car(this.car(lst));
        this.cadr = (lst) => this.car(this.cdr(lst));
        this.cdar = (lst) => this.cdr(this.car(lst));
        this.cddr = (lst) => this.cdr(this.cdr(lst));
        this.inter = interpreter;
    }
    eval(expr, env) {
        switch (expr[0]) {
            case "eq?": return this.inter.evalExpr(expr[1], env) === this.inter.evalExpr(expr[2], env);
            case "boolean?": return this.isBoolean(this.inter.evalExpr(expr[1], env));
            case "null?": return this.isNull(this.inter.evalExpr(expr[1], env));
            case "number?": return this.isNumber(this.inter.evalExpr(expr[1], env));
            case "string?": return this.isString(this.inter.evalExpr(expr[1], env));
            case "pair?": return this.isPair(this.inter.evalExpr(expr[1], env));
            case "list?": return this.isList(this.inter.evalExpr(expr[1], env));
            case "cons": return this.evalCons(expr.slice(1), env);
            case "car": return this.car(this.inter.evalExpr(expr[1], env));
            case "cdr": return this.cdr(this.inter.evalExpr(expr[1], env));
            case "caar": return this.caar(this.inter.evalExpr(expr[1], env));
            case "cadr": return this.cadr(this.inter.evalExpr(expr[1], env));
            case "cdar": return this.cdar(this.inter.evalExpr(expr[1], env));
            case "cddr": return this.cddr(this.inter.evalExpr(expr[1], env));
            case "length": return this.length(this.inter.evalExpr(expr[1], env));
        }
        return "##not-resolved##";
    }
    evalCons(argsLst, env) {
        const a = this.inter.evalExpr(argsLst[0], env);
        const b = this.inter.evalExpr(argsLst.slice(1), env);
        if (b === null)
            return [a];
        if (this.isList(b))
            return b.unshift(a) && b;
        return [a, b];
    }
}
class StringLib {
    constructor(interpreter) {
        this.inter = interpreter;
    }
    eval(expr, env) {
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
    static isDigit(ch) {
        return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(ch) > -1;
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
