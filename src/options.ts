"use strict";

class Options {
    public print: Function;
    public isDebug: boolean;
    public libs: string[];

    constructor() {
        this.print = console.log;
        this.isDebug = false;
        this.libs = ["core-lib", "date-lib", "list-lib", "math-lib",
            "number-lib", "scheme-lib", "string-lib"];
    }

    public static parse(options: any): Options {
        const evalOptions = new Options();

        if (typeof options.print === "function") {
            evalOptions.print = options.print;
        }

        if (typeof options.isDebug === "boolean") {
            evalOptions.isDebug = options.isDebug;
        }

        if (Array.isArray(options.libs)) {
            evalOptions.libs = options.libs.slice();
        }

        return evalOptions;
    }
}
