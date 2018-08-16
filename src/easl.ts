"use strict";

class Easl {

    private interpreter: Interpreter;

    constructor() {
        this.interpreter = new Interpreter();
    }

    public evaluate(codeText: string, optionsParam?: EvalOptions) {
        const options = optionsParam
            ? EvalOptions.parse(optionsParam)
            : new EvalOptions();

        try {
            const codeTree = Parser.parse(codeText);
            const output = this.interpreter.evalCodeTree(codeTree, options);
            return output;
        } catch (e) {
            return e.toString();
        }
    }
}

module.exports.Easl = Easl;
