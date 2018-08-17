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
        this.isDebug = false;
        this.print = console.log;
        this.libs = [];
        this.libs.push(new CoreLib(this));
        this.libs.push(new SchemeLib(this));
        this.libs.push(new ListLib(this));
        this.libs.push(new StringLib(this));
        this.libs.push(new MathLib(this));
        this.libs.push(new NumberLib(this));
    }
    evalCodeTree(codeTree, options) {
        this.isDebug = options.isDebug;
        this.print = options.print;
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
        const res = [];
        for (const expr of exprLst) {
            res.push(this.evalExpr(expr, env));
        }
        return res;
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
            case "set!": return this.evalSet(expr, env);
            case "lambda": return this.evalLambda(expr, env);
            case "function": return this.evalFunction(expr, env);
            case "if": return this.evalIf(expr, env);
            case "cond": return this.evalCond(expr, env);
            case "case": return this.evalCase(expr, env);
            case "begin": return this.evalExprLst(expr.slice(1), env);
            case "for": return this.evalFor(expr, env);
        }
        const res = this.resolveThroughLib(expr, env);
        if (res[0])
            return res[1];
        return this.applyProcedure(expr, env);
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
                throw Error(`Identifier already defined: ${symbol}`);
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
    applyProcedure(expr, env) {
        const closure = this.evalExpr(expr[0], env);
        const args = (expr.length > 1) ? this.mapExprLst(expr.slice(1), env) : [];
        if (this.isDebug) {
            console.log("applProc proc:", JSON.stringify(closure));
            console.log("applProc args:", JSON.stringify(args));
        }
        const closureBody = closure[2].length === 1 ? closure[2][0] : closure[2];
        const closureEnv = this.assocList(closure[1], args).concat(env).concat(closure[3]);
        return this.evalExpr(closureBody, closureEnv);
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
        const body = expr.length === 4 ? expr[3] : ["begin", ...expr.slice(3)];
        const value = this.evalLambda(["lambda", expr[2], body], env);
        env.unshift([expr[1], value]);
        return symbol;
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
    evalCase(expr, env) {
        const val = this.evalExpr(expr[1], env);
        return this.evalCaseLoop(val, expr.slice(2), env);
    }
    evalCaseLoop(val, condClauses, env) {
        const clause = condClauses[0];
        if (clause[0] === "else") {
            return this.evalExprLst(clause.slice(1), env);
        }
        if (clause[0].indexOf(val) > -1) {
            return this.evalExprLst(clause.slice(1), env);
        }
        return this.evalCaseLoop(val, condClauses.slice(1), env);
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
    resolveThroughLib(expr, env) {
        for (const lib of this.libs) {
            const res = lib.libEvalExpr(expr, env);
            if (res !== "##not-resolved##")
                return [true, res];
        }
        return [false, null];
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
class CoreLib {
    constructor(interpreter) {
        this.inter = interpreter;
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "+": return this.inter.evalExpr(expr[1], env) + this.inter.evalExpr(expr[2], env);
            case "-": return this.inter.evalExpr(expr[1], env) - this.inter.evalExpr(expr[2], env);
            case "*": return this.inter.evalExpr(expr[1], env) * this.inter.evalExpr(expr[2], env);
            case "/": return this.inter.evalExpr(expr[1], env) / this.inter.evalExpr(expr[2], env);
            case "=": return this.inter.evalExpr(expr[1], env) === this.inter.evalExpr(expr[2], env);
            case ">": return this.inter.evalExpr(expr[1], env) > this.inter.evalExpr(expr[2], env);
            case "<": return this.inter.evalExpr(expr[1], env) < this.inter.evalExpr(expr[2], env);
            case "!=": return this.inter.evalExpr(expr[1], env) !== this.inter.evalExpr(expr[2], env);
            case ">=": return this.inter.evalExpr(expr[1], env) >= this.inter.evalExpr(expr[2], env);
            case "<=": return this.inter.evalExpr(expr[1], env) <= this.inter.evalExpr(expr[2], env);
            case "and": return this.inter.evalExpr(expr[1], env) && this.inter.evalExpr(expr[2], env);
            case "or": return this.inter.evalExpr(expr[1], env) || this.inter.evalExpr(expr[2], env);
            case "not": return this.evalNot(this.inter.evalExpr(expr[1], env));
            case "type-of": return this.evalTypeOf(expr[1], env);
            case "to-string": return String(this.inter.evalExpr(expr[1], env));
            case "to-number": return this.toNumber(this.inter.evalExpr(expr[1], env));
            case "to-boolean": return this.toBoolean(this.inter.evalExpr(expr[1], env));
            case "print": return this.inter.print(String(this.inter.mapExprLst(expr.slice(1), env).join(" "))) || "";
        }
        return "##not-resolved##";
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
        const value = this.inter.evalExpr(expr, env);
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
}
class ListLib {
    constructor(interpreter) {
        this.inter = interpreter;
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "list.empty": return [];
            case "list.empty?": return this.listEmpty(expr, env);
            case "list.has?": return this.listHas(expr, env);
            case "list.length": return this.listLength(expr, env);
            case "list.first": return this.listFirst(expr, env);
            case "list.rest": return this.listRest(expr, env);
            case "list.last": return this.listLast(expr, env);
            case "list.least": return this.listLeast(expr, env);
            case "list.add": return this.listAdd(expr, env);
            case "list.add!": return this.listAdd(expr, env, false);
            case "list.push": return this.listPush(expr, env);
            case "list.push!": return this.listPush(expr, env, false);
            case "list.index": return this.listIndex(expr, env);
            case "list.get": return this.listGet(expr, env);
            case "list.set": return this.listSet(expr, env);
            case "list.set!": return this.listSet(expr, env, false);
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
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "math.pi": return Math.PI;
            case "math.abs": return Math.abs(this.inter.evalExpr(expr[1], env));
            case "math.ceil": return Math.ceil(this.inter.evalExpr(expr[1], env));
            case "math.floor": return Math.floor(this.inter.evalExpr(expr[1], env));
            case "math.log": return Math.log10(this.inter.evalExpr(expr[1], env));
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
    libEvalExpr(expr, env) {
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
        this.caar = (lst) => lst[0][0];
        this.cadr = (lst) => lst[1];
        this.cdar = (lst) => lst[0].slice(1);
        this.cddr = (lst) => lst.slice(2);
        this.inter = interpreter;
    }
    libEvalExpr(expr, env) {
        switch (expr[0]) {
            case "eq?": return this.inter.evalExpr(expr[1], env) === this.inter.evalExpr(expr[2], env);
            case "boolean?": return this.isBoolean(this.inter.evalExpr(expr[1], env));
            case "null?": return this.isNull(this.inter.evalExpr(expr[1], env));
            case "number?": return this.isNumber(this.inter.evalExpr(expr[1], env));
            case "string?": return this.isString(this.inter.evalExpr(expr[1], env));
            case "pair?": return this.isPair(this.inter.evalExpr(expr[1], env));
            case "list?": return this.isList(this.inter.evalExpr(expr[1], env));
            case "cons": return this.evalCons(expr, env);
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
    evalCons(expr, env) {
        const a = this.inter.evalExpr(expr[1], env);
        const b = this.inter.evalExpr(expr[2], env);
        if (b === null)
            return [a];
        if (this.isList(b)) {
            return b.unshift(a) && b;
        }
        return [a, b];
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
