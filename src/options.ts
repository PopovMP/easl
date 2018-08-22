"use strict";

class Options {
    public printer: Function;
    public libs: string[];

    constructor() {
        this.printer = console.log;
        this.libs = ["core-lib", "date-lib", "list-lib", "math-lib", "number-lib", "string-lib"];
    }

    public static parse(options: any): Options {
        const evalOptions = new Options();

        if (typeof options.printer === "function") {
            evalOptions.printer = options.printer;
        }

        if (Array.isArray(options.libs)) {
            evalOptions.libs = options.libs.slice();
        }

        return evalOptions;
    }
}
