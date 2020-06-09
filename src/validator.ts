"use strict";

class Validator {
    public static assertArrayIndex(name: string, arr: any[], index: number): void {
        if (arr.length === 0) {
            throw `Error: '${name}' index operation of an empty list`;
        }

        if (index < 0 || index >= arr.length) {
            throw `Error: '${name}' list index out of range. Given: ${index}, list length ${arr.length}`;
        }
    }
}
