"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('str library', function () {

    describe('str.length', function () {
        it('empty string', function () {
            assert.strictEqual(easl.evaluate(`(str.length "")`), 0);
        });

        it('non empty string', function () {
            assert.strictEqual(easl.evaluate(`(str.length "hello")`), 5);
        });
    });

    describe('str.has', function () {
        it('non existing substring', function () {
            assert.strictEqual(easl.evaluate(`(str.has "la" "hello")`), false);
        });

        it('existing substring', function () {
            assert.strictEqual(easl.evaluate(`(str.has "lo" "hello")`), true);
        });
    });

    describe('str.concat', function () {
        it('non existing substring', function () {
            assert.strictEqual(easl.evaluate(`(str.concat "Hello " "world!")`), "Hello world!");
        });
    });

    describe('multiple operations', function () {
        it('length of concat', function () {
            assert.strictEqual(easl.evaluate(`
            
            (str.length  (str.concat "Hello " "world!"))`), 12);
        });
    });
});
