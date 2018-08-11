"use strict";

const assert = require("assert");
const Application = require("../index").Application;

const app = new Application();

describe('list', function () {
    describe('list.empty', function () {
        it('(list.empty) → []', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.empty)       `), []);
        });
    });

    describe('list.length', function () {
        it('not a list:  (list.length 42) → -1', function () {
            assert.strictEqual(app.evaluate(`   (list.length 42)        `), -1);
        });
        it('empty list:  (list.length []) → 0', function () {
            assert.strictEqual(app.evaluate(`   (list.length [])        `), 0);
        });
        it('non empty list:  (list.length [1 2 3]) → 3', function () {
            assert.strictEqual(app.evaluate(`   (list.length [1 2 3])   `), 3);
        });
    });


    describe('list.first', function () {
        it('not a list:  (list.first 42) → null', function () {
            assert.strictEqual(app.evaluate(`   (list.first 42)        `), null);
        });
        it('empty list:  (list.first []) → null', function () {
            assert.strictEqual(app.evaluate(`   (list.first [])        `), null);
        });
        it('non empty list:  (list.first [1 2 3]) → 1', function () {
            assert.strictEqual(app.evaluate(`   (list.first [1 2 3])   `), 1);
        });
    });

    describe('list.last', function () {
        it('not a list:  (list.last 42) → null', function () {
            assert.strictEqual(app.evaluate(`   (list.last 42)        `), null);
        });
        it('empty list:  (list.last []) → null', function () {
            assert.strictEqual(app.evaluate(`   (list.last [])        `), null);
        });
        it('non empty list:  (list.last [1 2 3]) → 3', function () {
            assert.strictEqual(app.evaluate(`   (list.last [1 2 3])   `), 3);
        });
    });

    describe('list.rest', function () {
        it('not a list:  (list.rest 42) → null', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.rest 42)        `), []);
        });
        it('empty list:  (list.rest []) → null', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.rest [])        `), []);
        });
        it('non empty list:  (list.rest [1 2 3]) → 3', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.rest [1 2 3])   `), [2, 3]);
        });
    });


    describe('list.least', function () {
        it('not a list:  (list.least 42) → null', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.least 42)        `), []);
        });
        it('empty list:  (list.least []) → null', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.least [])        `), []);
        });
        it('non empty list:  (list.least [1 2 3]) → 3', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.least [1 2 3])   `), [1, 2]);
        });
    });

    describe('list.add', function () {
        it('not a list:  (list.add 2 1) → [2, 1]', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.add 2 1)        `), [1, 2]);
        });
        it('empty list:  (list.add 2 []) → [2]', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.add 2 [])        `), [2]);
        });
        it('null:  (list.add 2 null) → [2]', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.add 2 null)        `), [2]);
        });
        it('non empty list:  (list.add 3 [1 2]) → [1, 2, 3]', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.add 3 [1 2])      `), [1, 2, 3]);
        });
        it('two list:  (list.add [3 4] [1 2]) → [1, 2, [3, 4]]', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.add [3 4] [1 2])      `), [1, 2, [3, 4]]);
        });
    });

    describe('list.push', function () {
        it('not a list:  (list.push 1 2) → [1, 2]', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.push 1 2)        `), [1, 2]);
        });
        it('empty list:  (list.push 2 []) → [2]', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.push 2 [])        `), [2]);
        });
        it('null:  (list.push 2 null) → [2]', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.push 2 null)        `), [2]);
        });
        it('non empty list:  (list.push 1 [2 3]) → [1, 2, 3]', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.push 1 [2 3])      `), [1, 2, 3]);
        });
        it('two list:  (list.push [1 2] [3 4]) → [1, 2, [3, 4]]', function () {
            assert.deepStrictEqual(app.evaluate(`   (list.push [1 2] [3 4])      `), [[1, 2], 3, 4]);
        });
    });

    describe('list.index', function () {
        it('not a list:  (list.index 1 2) → -1', function () {
            assert.strictEqual(app.evaluate(`   (list.index 1 2)        `), -1);
        });
        it('empty list:  (list.index 2 []) → -1', function () {
            assert.strictEqual(app.evaluate(`   (list.index 2 [])        `), -1);
        });
        it('null:  (list.index 2 null) → -1', function () {
            assert.strictEqual(app.evaluate(`   (list.index 2 null)        `), -1);
        });
        it('existing element:  (list.index 2 [1 2 3]) → 1', function () {
            assert.strictEqual(app.evaluate(`   (list.index 2 [1 2 3])      `), 1);
        });
        it('non existing element:  (list.index 2 [3 4]) → -1', function () {
            assert.strictEqual(app.evaluate(`   (list.index 2 [3 4])      `), -1);
        });
    });

});
