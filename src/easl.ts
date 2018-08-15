"use strict";

class Easl {

    private interpreter: Interpreter;

    constructor() {
        this.interpreter = new Interpreter();
    }

    public evaluate(codeText: string, debug?: boolean) {
        const codeTree = Parser.parse(codeText);

        // console.time("Eval time");

        const output = this.interpreter.evalCodeTree(codeTree, debug);

        // console.timeEnd("Eval time");

        return output;
    }
}

module.exports.Easl = Easl;
