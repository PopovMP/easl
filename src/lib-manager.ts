"use strict";

interface ILib {
    libEvalExpr(expr: any[], env: any[]): any;
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
