"use strict";

class Easl {

    private interpreter: Interpreter;

    constructor() {
        this.interpreter = new Interpreter();
    }

    public evaluate(codeText: string, optionsParam?: Options) {
        const options = optionsParam
            ? Options.parse(optionsParam)
            : new Options();

        try {
            const codeTree = Parser.parse(codeText);
            const output = this.interpreter.evalCodeTree(codeTree, options);
            return output;
        } catch (e) {
            return e.toString();
        }
    }
}

if (typeof module === "object") {
    module.exports.Easl = Easl;
}
