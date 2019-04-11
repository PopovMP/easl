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
            function getFive () {
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
              res                                               `, options)  , 11);
        });

        it('string args', function () {
            assert.strictEqual(easl.evaluate(`
              (ext.concat "Hello " "World!")                    `, options)  , "Hello World!");
        });
    });
});
