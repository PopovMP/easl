"use strict";

class Grammar {
    public static numberRegExp = /^[-+]?\d+(?:-\d\d\d)*(?:\.\d+)*$/;
    public static openParenChars: string[] = ["(", "[", "{"];
    public static closeParenChars: string[] = [")", "]", "}"];
    public static whiteSpaceChars: string[] = [" ", "\t"];
    public static endOfLineChars: string[] = ["\r", "\n"];
    public static commentStartChars: string[] = [";"];
    public static stringEncloseChars: string[] = ["\""];


    public static isParen(ch: string): boolean {
        return Grammar.isOpenParen(ch) || Grammar.isCloseParen(ch);
    }

    public static isOpenParen(ch: string): boolean {
        return Grammar.openParenChars.indexOf(ch) > -1;
    }

    public static isCloseParen(ch: string): boolean {
        return Grammar.closeParenChars.indexOf(ch) > -1;
    }

    public static isDigit(ch: string): boolean {
        return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(ch) > -1;
    }

    public static isWhiteSpace(ch: string): boolean {
        return Grammar.whiteSpaceChars.indexOf(ch) > -1 ||
            Grammar.endOfLineChars.indexOf(ch) > -1;
    }

    public static isStringEnclosureChar(ch: string): boolean {
        return Grammar.stringEncloseChars.indexOf(ch) > -1;
    }

    public static isLineComment(ch: string): boolean {
        return Grammar.commentStartChars.indexOf(ch) > -1;
    }

    public static isEndOfLine(ch: string): boolean {
        return Grammar.endOfLineChars.indexOf(ch) > -1;
    }

    public static isNumber(text: string): boolean {
        return Grammar.numberRegExp.test(text);
    }
}
