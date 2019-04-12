"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('ext library', function () {

    describe('Call func with no params', function () {
        it('call lambda', function () {
            const options = {extContext: this, extFunctions: {"ext.getFive": () => 5}};

            assert.strictEqual(easl.evaluate(`  (ext.getFive)  `, options), 5);
        });

        it('call named function', function () {
            function getFive() {
                return 5;
            }

            const options = {extContext: this, extFunctions: {"ext.getFive": getFive}};

            assert.strictEqual(easl.evaluate(`  (ext.getFive)  `, options), 5);
        });
    });

    describe('Call func with params', function () {
        function sum(a, b) {
            return a + b;
        }

        function concat(text1, text2) {
            return text1 + text2;
        }

        const options = {extContext: this, extFunctions: {"ext.sum": sum, "ext.concat": concat}};

        it('call with numbers', function () {
            assert.strictEqual(easl.evaluate(`  (ext.sum 3 4)  `, options), 7);
        });

        it('call with func calls', function () {
            assert.strictEqual(easl.evaluate(`
              {let res (ext.sum (2 + 3) (2 + 4))}
              res                                               `, options), 11);
        });

        it('string args', function () {
            assert.strictEqual(easl.evaluate(`
              (ext.concat "Hello " "World!")                    `, options), "Hello World!");
        });
    });

    describe('Ext functions return types', function () {
        it('number 0', function () {
            const options = {extContext: this, extFunctions: {"ext.get": () => 0}};

            assert.strictEqual(easl.evaluate(`  (type-of (ext.get))  `, options), "number");
        });

        it('number 1', function () {
            const options = {extContext: this, extFunctions: {"ext.get": () => 1}};

            assert.strictEqual(easl.evaluate(`  (type-of (ext.get))  `, options), "number");
        });

        it('number -1', function () {
            const options = {extContext: this, extFunctions: {"ext.get": () => -1}};

            assert.strictEqual(easl.evaluate(`  (type-of (ext.get))  `, options), "number");
        });

        it('number 3.14', function () {
            const options = {extContext: this, extFunctions: {"ext.get": () => 3.14}};

            assert.strictEqual(easl.evaluate(`  (type-of (ext.get))  `, options), "number");
        });

        it('string ""', function () {
            const options = {extContext: this, extFunctions: {"ext.get": () => ""}};

            assert.strictEqual(easl.evaluate(`  (type-of (ext.get))  `, options), "string");
        });

        it('string "a"', function () {
            const options = {extContext: this, extFunctions: {"ext.get": () => "a"}};

            assert.strictEqual(easl.evaluate(`  (type-of (ext.get))  `, options), "string");
        });

        it('bool true', function () {
            const options = {extContext: this, extFunctions: {"ext.get": () => true}};

            assert.strictEqual(easl.evaluate(`  (type-of (ext.get))  `, options), "boolean");
        });

        it('bool false', function () {
            const options = {extContext: this, extFunctions: {"ext.get": () => false}};

            assert.strictEqual(easl.evaluate(`  (type-of (ext.get))  `, options), "boolean");
        });

        it('null', function () {
            const options = {extContext: this, extFunctions: {"ext.get": () => null}};

            assert.strictEqual(easl.evaluate(`  (type-of (ext.get))  `, options), "null");
        });

        it('[]', function () {
            const options = {extContext: this, extFunctions: {"ext.get": () => []}};

            assert.strictEqual(easl.evaluate(`  (type-of (ext.get))  `, options), "list");
        });

        it('[1]', function () {
            const options = {extContext: this, extFunctions: {"ext.get": () => [1]}};

            assert.strictEqual(easl.evaluate(`  (type-of (ext.get))  `, options), "list");
        });
    });

    describe('Ext functions arg types', function () {
        const options = {extContext: this, extFunctions: {"ext.typeof": (a) => typeof a}};
        it('number 0', function () {
            assert.strictEqual(easl.evaluate(`  (ext.typeof 0)  `, options), "number");
        });

        it('number 1', function () {
            assert.strictEqual(easl.evaluate(`  (ext.typeof 1)  `, options), "number");
        });

        it('number -1', function () {
            assert.strictEqual(easl.evaluate(`  (ext.typeof -1)  `, options), "number");
        });

        it('number 3.14', function () {
            assert.strictEqual(easl.evaluate(`  (ext.typeof 3.14)  `, options), "number");
        });

        it('string ""', function () {
            assert.strictEqual(easl.evaluate(`  (ext.typeof "")  `, options), "string");
        });

        it('string "a"', function () {
            assert.strictEqual(easl.evaluate(`  (ext.typeof "a")  `, options), "string");
        });

        it('bool true', function () {
            assert.strictEqual(easl.evaluate(`  (ext.typeof true)  `, options), "boolean");
        });

        it('bool false', function () {
            assert.strictEqual(easl.evaluate(`  (ext.typeof false)  `, options), "boolean");
        });

        it('null', function () {
            assert.strictEqual(easl.evaluate(`  (ext.typeof null)  `, options), "object");
        });

        it('[]', function () {
            assert.strictEqual(easl.evaluate(`  (ext.typeof [])  `, options), "object");
        });

        it('[1]', function () {
            assert.strictEqual(easl.evaluate(`  (ext.typeof [1])  `, options), "object");
        });
    });

    describe('Working with lists', function () {
        it('num element', function () {
            const options = {extContext: this, extFunctions: {"ext.getList": () => [1]}};

            assert.strictEqual(easl.evaluate(`  (type-of (list.get (ext.getList) 0))  `, options), "number");
        });

        it('string element', function () {
            const options = {extContext: this, extFunctions: {"ext.getList": () => ["a", "b"]}};

            assert.strictEqual(easl.evaluate(`  (type-of (list.get (ext.getList) 1))  `, options), "string");
        });

        it('null element', function () {
            const options = {extContext: this, extFunctions: {"ext.getList": () => [null]}};

            assert.strictEqual(easl.evaluate(`  (type-of (list.get (ext.getList) 0))  `, options), "null");
        });

        it('boolean element', function () {
            const options = {extContext: this, extFunctions: {"ext.getList": () => [true]}};

            assert.strictEqual(easl.evaluate(`  (type-of (list.get (ext.getList) 0))  `, options), "boolean");
        });

        it('list length', function () {
            const options = {extContext: this, extFunctions: {"ext.getList": () => [1, 2, 3]}};

            assert.strictEqual(easl.evaluate(`  (list.length (ext.getList))  `, options), 3);
        });

        it('list sum', function () {
            const options = {extContext: this, extFunctions: {"ext.getList": () => [1, 2, 3]}};

            assert.strictEqual(easl.evaluate(`  (call + (ext.getList))       `, options), 6);
        });

        it('list concat', function () {
            const options = {extContext: this, extFunctions: {"ext.getList": () => ["a", "b", "c"]}};

            assert.strictEqual(easl.evaluate(`
                    {let lst (ext.getList)}
                    (+ (list.get lst 0)
                       (list.get lst 1)
                       (list.get lst 2) )
                                                    `, options), "abc");
        });
    });
});
