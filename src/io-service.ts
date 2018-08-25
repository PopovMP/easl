"use strict";

const XMLHttpRequestLib = (typeof XMLHttpRequest === "function")
    ? XMLHttpRequest
    : require("xmlhttprequest").XMLHttpRequest;

const localStorageLib = (typeof localStorage === "object" && localStorage !== null)
    ? localStorage
    : new (require("node-localstorage").LocalStorage)("./easl-local-storage");

class IoService {
    public static get(url: string, callback: (res: string) => void): void {
        const xmlHttp: XMLHttpRequest = new XMLHttpRequestLib();
        xmlHttp.onreadystatechange = readyStateChange;
        xmlHttp.onerror = error;
        xmlHttp.open("GET", url, true);
        xmlHttp.send();

        function readyStateChange(): void {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                callback(xmlHttp.responseText);
            }
        }

        function error(e: any) {
            throw Error("Error while getting: " + url + ", " + e.message);
        }
    }

    public static setItemToLocalStorage(key: string, item: any): void {
        try {
            if (typeof item === "string") {
                localStorageLib.setItem(key, item);
            } else {
                localStorageLib.setItem(key, JSON.stringify(item));
            }
        } catch (e) {
            throw Error("Set item to local storage: " + key + ", " + e.message);
        }
    }

    public static getItemFromLocalStorage(key: string): any {
        try {
            const value: any = localStorageLib.getItem(key);
            return value && JSON.parse(value);
        } catch (e) {
            throw Error("Get item to local storage: " + key + ", " + e.message);
        }
    }
}
