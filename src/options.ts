"use strict";

class Options {
    public printer: Function;
    public libs: string[];
    public extContext: any;
    public extFunctions: any;

    constructor() {
        this.printer = console.log;
        this.libs = ["core-lib", "date-lib", "ext-lib", "list-lib", "math-lib", "number-lib", "string-lib"];
        this.extContext = this;
        this.extFunctions = {};
    }

    public static parse(options: any): Options {
        const evalOptions = new Options();

        if (typeof options.printer === "function") {
            evalOptions.printer = options.printer;
        }

        if (Array.isArray(options.libs)) {
            evalOptions.libs = options.libs.slice();
        }

        if (options.extContext) {
            evalOptions.extContext = options.extContext;
        }

        if (options.extFunctions) {
            evalOptions.extFunctions = options.extFunctions;
        }

        return evalOptions;
    }
}
