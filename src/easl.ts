"use strict";

class Easl {
    public evaluate(codeText: string, optionsParam?: Options, callback?: Function) {
        const options = optionsParam ? Options.parse(optionsParam) : new Options();
        const parser = new Parser();
        const interpreter = new Interpreter();

        try {
            const ilCode = parser.parse(codeText);
            return interpreter.evalCodeTree(ilCode, options, callback);
        } catch (e) {
            if (typeof callback === "function") {
                callback(e.toString());
            } else {
                return e.toString();
            }
        }
    }
}

if (typeof module === "object") {
    module.exports.Easl = Easl;
}
