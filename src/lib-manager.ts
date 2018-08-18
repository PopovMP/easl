"use strict";

class LibManager {

    public static getBuiltinLibs(libList: string[], inter: Interpreter): ILib[] {
        return libList.map(lib => LibManager.createLib(lib, inter));
    }

    public static createLib(libName: string, inter: Interpreter): ILib {
        switch (libName) {
            case "core-lib":
                return new CoreLib(inter);
            case "date-lib":
                return new DateLib(inter);
            case "list-lib":
                return new ListLib(inter);
            case "math-lib":
                return new MathLib(inter);
            case "number-lib":
                return new NumberLib(inter);
            case "scheme-lib":
                return new SchemeLib(inter);
            case "string-lib":
                return new StringLib(inter);
            default:
                throw Error("Unknown lib: " + libName);
        }
    }
}
