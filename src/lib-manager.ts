"use strict";

interface ILib {
    libEvalExpr(expr: any[], env: any[]): any;

    builtinFunc: string[];
    builtinHash: any;
}

class LibManager {

    public static getBuiltinLibs(libList: string[], inter: Interpreter): ILib[] {
        return libList.map(lib => LibManager.createLib(lib, inter));
    }

    public static createLib(libName: string, inter: Interpreter): ILib {
        switch (libName) {
            case "core-lib"   : return new CoreLib(inter);
            case "date-lib"   : return new DateLib(inter);
            case "list-lib"   : return new ListLib(inter);
            case "math-lib"   : return new MathLib(inter);
            case "number-lib" : return new NumberLib(inter);
            case "string-lib" : return new StringLib(inter);
            default: throw Error("Unknown lib: " + libName);
        }
    }

    public static manageImports(codeTree: any[], callback: (codeTree: any[]) => void): void {
        const code: any[] = [];
        let currentCodeIndex: number = 0;

        searchImports(currentCodeIndex);

        function searchImports(index: number): void {
            for (let i = index; i < codeTree.length; i++) {
                const expr: any = codeTree[i];
                if (Array.isArray(expr) && expr[0] === "import") {
                    currentCodeIndex = i;
                    const libUrl: string = expr[1][1];
                    LibManager.importLibrary(libUrl, libManager_import_ready);
                    return;
                } else {
                    code.push(expr);
                }
            }

            callback(code);
        }

        function libManager_import_ready(libCodeTree: any[]): void {
            code.push(...libCodeTree);
            searchImports(currentCodeIndex + 1);
        }
    }

    public static importLibrary(libUrl: string, callback: (lib: any[]) => void): void {
        if (typeof  libUrl !== "string" || libUrl.length === 0) {
            throw Error("Empty library name");
        }

        const storedLib: any[] = IoService.getItemFromLocalStorage(libUrl);
        if (Array.isArray(storedLib) && storedLib.length > 0) {
            callback(storedLib);
            return;
        }

        const libName = libUrl.substring(libUrl.lastIndexOf('/') + 1);

        IoService.get(libUrl, ioService_get_ready);

        function ioService_get_ready(libText: string) {
            if (typeof  libUrl !== "string" || libUrl.length === 0) {
                throw Error("Cannot load library content: " + libName);
            }

            const parser: Parser = new Parser();
            const libCode = parser.parse(libText);

            IoService.setItemToLocalStorage(libUrl, libCode);

            callback(libCode);
        }
    }
}
