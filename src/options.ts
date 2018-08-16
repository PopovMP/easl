"use strict";

class Options {
    public print: Function;
    public isDebug: boolean;

    constructor() {
        this.print = console.log;
        this.isDebug = false;
    }

    public static parse(options: any): Options {
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
