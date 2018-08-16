"use strict";

class EvalOptions {
    public print: Function;
    public isDebug: boolean;

    constructor() {
        this.print = console.log;
        this.isDebug = false;
    }

    public static parse(options: any): EvalOptions {
        const evalOptions = new EvalOptions();

        if (typeof options.print === "function") {
            evalOptions.print = options.print;
        }

        if (typeof options.isDebug === "boolean") {
            evalOptions.isDebug = options.isDebug;
        }

        return evalOptions;
    }
}
