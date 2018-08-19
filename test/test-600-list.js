"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('list', function () {

    describe('list.add', function () {
        it('not a list:  (list.add 2 1) → [2, 1]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.add 2 1)        `), [1, 2]);
        });
        it('empty list:  (list.add 2 []) → [2]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.add 2 [])        `), [2]);
        });
        it('null:  (list.add 2 null) → [2]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.add 2 null)        `), [2]);
        });
        it('non empty list:  (list.add 3 [1 2]) → [1, 2, 3]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.add 3 [1 2])      `), [1, 2, 3]);
        });
        it('two list:  (list.add [3 4] [1 2]) → [1, 2, [3, 4]]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.add [3 4] [1 2])      `), [1, 2, [3, 4]]);
        });
        it('it is pure', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [2 3]}
             (list.add 1 lst)
             lst                  `), [2, 3]);
        });
    });

    describe('list.add!', function () {
        it('it mutates', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [2 3]}
             (list.add! 1 lst)
             lst                  `), [2, 3, 1]);
        });
    });

    describe('list.append', function () {
        it('set element:  (list.append [3 4] [1 2]) → [1 2 3 4]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.append [3 4] [1 2])     `), [ 1, 2, 3, 4 ]);
        });
    });

    describe('list.empty', function () {
        it('(list.empty) → []', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.empty)       `), []);
        });
    });

    describe('list.empty?', function () {
        it('(list.empty? (list.empty)) → true', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.empty? (list.empty))     `), true);
        });
        it('(list.empty? [1 2 3]) → false', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.empty? [1 2 3])          `), false);
        });
        it('(list.empty? "bla") → false', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.empty? "bla")            `), true);
        });
        it('(list.empty? 42) → false', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.empty? 42)               `), true);
        });
    });

    describe('list.first', function () {
        it('not a list:  (list.first 42) → null', function () {
            assert.strictEqual(easl.evaluate(`   (list.first 42)        `), null);
        });
        it('empty list:  (list.first []) → null', function () {
            assert.strictEqual(easl.evaluate(`   (list.first [])        `), null);
        });
        it('non empty list:  (list.first [1 2 3]) → 1', function () {
            assert.strictEqual(easl.evaluate(`   (list.first [1 2 3])   `), 1);
        });
    });

    describe('list.flatten', function () {
        it('flattens', function () {
            assert.deepStrictEqual(easl.evaluate(` (list.flatten [[1 2] [3 4]])  `), [1, 2, 3, 4]);
        });
    });

    describe('list.index', function () {
        it('not a list:  (list.index 1 2) → -1', function () {
            assert.strictEqual(easl.evaluate(`   (list.index 1 2)        `), -1);
        });
        it('empty list:  (list.index 2 []) → -1', function () {
            assert.strictEqual(easl.evaluate(`   (list.index 2 [])        `), -1);
        });
        it('null:  (list.index 2 null) → -1', function () {
            assert.strictEqual(easl.evaluate(`   (list.index 2 null)        `), -1);
        });
        it('existing element:  (list.index 2 [1 2 3]) → 1', function () {
            assert.strictEqual(easl.evaluate(`   (list.index 2 [1 2 3])      `), 1);
        });
        it('non existing element:  (list.index 2 [3 4]) → -1', function () {
            assert.strictEqual(easl.evaluate(`   (list.index 2 [3 4])      `), -1);
        });
    });

    describe('list.last', function () {
        it('not a list:  (list.last 42) → null', function () {
            assert.strictEqual(easl.evaluate(`   (list.last 42)        `), null);
        });
        it('empty list:  (list.last []) → null', function () {
            assert.strictEqual(easl.evaluate(`   (list.last [])        `), null);
        });
        it('non empty list:  (list.last [1 2 3]) → 3', function () {
            assert.strictEqual(easl.evaluate(`   (list.last [1 2 3])   `), 3);
        });
    });

    describe('list.least', function () {
        it('not a list:  (list.least 42) → null', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.least 42)        `), []);
        });
        it('empty list:  (list.least []) → null', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.least [])        `), []);
        });
        it('non empty list:  (list.least [1 2 3]) → 3', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.least [1 2 3])   `), [1, 2]);
        });
    });

    describe('list.length', function () {
        it('not a list:  (list.length 42) → -1', function () {
            assert.strictEqual(easl.evaluate(`   (list.length 42)        `), -1);
        });
        it('empty list:  (list.length []) → 0', function () {
            assert.strictEqual(easl.evaluate(`   (list.length [])        `), 0);
        });
        it('non empty list:  (list.length [1 2 3]) → 3', function () {
            assert.strictEqual(easl.evaluate(`   (list.length [1 2 3])   `), 3);
        });
    });

    describe('list.list?', function () {
        it('not a list:  (list.list? 42) → false', function () {
            assert.strictEqual(easl.evaluate(`   (list.list? 42)        `), false);
        });
        it('empty list:  (list.list? []) → true', function () {
            assert.strictEqual(easl.evaluate(`   (list.list? [])        `), true);
        });
        it('non empty list:  (list.list? [1 2 3]) → true', function () {
            assert.strictEqual(easl.evaluate(`   (list.list? [1 2 3])   `), true);
        });
    });

    describe('list.push', function () {
        it('not a list:  (list.push 1 2) → [1, 2]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push 1 2)        `), [1, 2]);
        });
        it('empty list:  (list.push 2 []) → [2]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push 2 [])        `), [2]);
        });
        it('null:  (list.push 2 null) → [2]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push 2 null)        `), [2]);
        });
        it('non empty list:  (list.push 1 [2 3]) → [1, 2, 3]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push 1 [2 3])       `), [1, 2, 3]);
        });
        it('two list:  (list.push [1 2] [3 4]) → [[1, 2], 3, 4]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push [1 2] [3 4])   `), [[1, 2], 3, 4]);
        });
        it('it is pure', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [2 3]}
             (list.push 1 lst)
             lst                  `), [2, 3]);
        });
    });

    describe('list.push!', function () {
        it('it mutates', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [2 3]}
             (list.push! 1 lst)
             lst                  `), [1, 2, 3]);
        });
    });

    describe('list.range', function () {
        it('from = to → []', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.range 5 5)        `), []);
        });
        it('from > to → []', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.range 10 5)        `), []);
        });
        it('(list.range 1 3) → [1 2 3]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.range 1 3)   `), [1, 2, 3]);
        });
    });

    describe('list.rest', function () {
        it('not a list:  (list.rest 42) → null', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.rest 42)        `), []);
        });
        it('empty list:  (list.rest []) → null', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.rest [])        `), []);
        });
        it('non empty list:  (list.rest [1 2 3]) → 3', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.rest [1 2 3])   `), [2, 3]);
        });
    });

    describe('list.set', function () {
        it('set element:  (list.set 42 1 [1 2 3]) → [1 42 3]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.set 42 1 [1 2 3])     `), [ 1, 42, 3 ]);
        });
        it('it is pur', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [2 3]}
             (list.set 5 1 lst)
             lst                  `), [2, 3]);
        });

    });

    describe('list.set!', function () {
        it('it mutates', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [2 3]}
             (list.set! 5 1 lst)
             lst                  `), [2, 5]);
        });
    });
});
