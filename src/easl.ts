"use strict";

class Easl {

    private interpreter: Interpreter;

    constructor() {
        this.interpreter = new Interpreter();
    }

    public evaluate(codeText: string, optionsParam?: Options, callback?: Function) {
        const options = optionsParam
            ? Options.parse(optionsParam)
            : new Options();

        try {
            const codeTree = Parser.parse(codeText);
            const output = this.interpreter.evalCodeTree(codeTree, options, callback);
            return output;
        } catch (e) {
            if (typeof callback === "function") {
                callback(String(e));
            } else {
                return e.toString();
            }
        }
    }
}

if (typeof module === "object") {
    module.exports.Easl = Easl;
}
