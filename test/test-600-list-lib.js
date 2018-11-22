"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('list', function () {

    describe('list.add', function () {
        it('not a list:  (list.add 1 2) → [1, 2]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.add 1 2)          `), [1, 2]);
        });
        it('empty list:  (list.add [] 2) → [2]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.add [] 2)         `), [2]);
        });
        it('null:  (list.add null 2) → [2]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.add null 2)       `), [2]);
        });
        it('non empty list:  (list.add [1 2] 3) → [1, 2, 3]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.add [1 2] 3)      `), [1, 2, 3]);
        });
        it('two list:  (list.add [1 2] [3 4]) → [1, 2, [3, 4]]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.add [1 2] [3 4])  `), [1, 2, [3, 4]]);
        });
        it('it mutates the list', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [1 2]}
             (list.add lst 3)    `), [1, 2, 3]);
        });
    });

    describe('list.concat', function () {
        it('set element:  (list.concat [1 2] [3 4]) → [1 2 3 4]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.concat [1 2] [3 4])     `), [ 1, 2, 3, 4 ]);
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
        it('not a list: (list.first 42) → null', function () {
            assert.strictEqual(easl.evaluate(`   (list.first 42)        `), null);
        });
        it('empty list: (list.first []) → null', function () {
            assert.strictEqual(easl.evaluate(`   (list.first [])        `), null);
        });
        it('non empty list: (list.first [1 2 3]) → 1', function () {
            assert.strictEqual(easl.evaluate(`   (list.first [1 2 3])   `), 1);
        });
    });

    describe('list.flatten', function () {
        it('flattens', function () {
            assert.deepStrictEqual(easl.evaluate(` (list.flatten [[1 2] [3 4]])  `), [1, 2, 3, 4]);
        });
    });

    describe('list.index', function () {
        it('not a list: (list.index 1 2) → -1', function () {
            assert.strictEqual(easl.evaluate(`   (list.index 1 2)          `), -1);
        });
        it('empty list: (list.index [] 1) → -1', function () {
            assert.strictEqual(easl.evaluate(`   (list.index [] 1)         `), -1);
        });
        it('null:  (list.index null 1) → -1', function () {
            assert.strictEqual(easl.evaluate(`   (list.index null 1)       `), -1);
        });
        it('existing element:  (list.index [1 2 3] 2) → 1', function () {
            assert.strictEqual(easl.evaluate(`   (list.index [1 2 3] 2)    `), 1);
        });
        it('non existing element:  (list.index [1 2] 3) → -1', function () {
            assert.strictEqual(easl.evaluate(`   (list.index [1 2] 3)      `), -1);
        });
    });

    describe('list.join', function () {
        it('empty list:  (list.join []) → ""', function () {
            assert.strictEqual(easl.evaluate(`   (list.join [])             `), "");
        });
        it('default delimiter:  (list.join [1 2 3]) → "1,2,3"', function () {
            assert.strictEqual(easl.evaluate(`   (list.join [1 2 3])        `), "1,2,3");
        });
        it('custom delimiter:  (list.join [1 2 3] "-") → "1-2-3"', function () {
            assert.strictEqual(easl.evaluate(`   (list.join [1 2 3] "-")    `), "1-2-3");
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
        it('not a list:  (list.push 2 1) → [1, 2]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push 2 1)            `), [1, 2]);
        });
        it('empty list:  (list.push [] 1) → [1]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push [] 1)           `), [1]);
        });
        it('null:  (list.push null 1) → [1]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push null 1)         `), [1]);
        });
        it('non empty list:  (list.push [2 3] 1) → [1, 2, 3]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push [2 3] 1)        `), [1, 2, 3]);
        });
        it('two list:  (list.push [3 4] [1 2]) → [[1, 2], 3, 4]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push [3 4] [1 2])    `), [[1, 2], 3, 4]);
        });
        it('it mutates the list', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [2 3]}
             (list.push lst 1)
             lst                  `), [1, 2, 3]);
        });
    });

    describe('list.range', function () {
        it('(list.range 3 1) → [3 2 1]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.range 3 1)   `), [3, 2, 1]);
        });
        it('(list.range 1 3) → [1 2 3]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.range 1 3)   `), [1, 2, 3]);
        });
        it('(list.range 3 3) → [3]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.range 3 3)   `), [3]);
        });
        it('(list.range 0 4 2) → [0 2 4]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.range 0 4 2) `), [0, 2, 4]);
        });
        it('(list.range 4 0 -2) → [4 2 0]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.range 4 0 -2)`), [4, 2, 0]);
        });
    });

    describe('list.reverse', function () {
        it('reverses a list', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             (list.reverse [3 2 1]) `), [1, 2, 3]);
        });
        it('mutates the original list', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [3 2 1]}
             (list.reverse lst)
             lst                  `), [1, 2, 3]);
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
        it('set element:  (list.set [1 2 3] 5 1) → [1 5 3]', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.set [1 2 3] 1 5)     `), [ 1, 5, 3 ]);
        });
        it('it mutates', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [1 2 3]}
             (list.set lst 1 5)
             lst                  `), [1, 5, 3]);
        });
    });

    describe('list.slice', function () {
        it('called with no args, slices the whole list', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [1 2 3 4 5]}
             (list.slice lst)           `), [1, 2, 3, 4, 5]);
        });
        it('called with one arg, slices from that index to the end', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [1 2 3 4 5]}
             (list.slice lst 2)         `), [3, 4, 5]);
        });
        it('called with two args, slices from to (exclusive)', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [1 2 3 4 5]}
             (list.slice lst 1 3)      `), [2, 3]);
        });
    });

    describe('list.sort', function () {
        it('sorts a list', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             (list.sort [3 1 2]) `), [1, 2, 3]);
        });
        it('mutates the original list', function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst [3 2 1]}
             (list.sort lst)
             lst                  `), [1, 2, 3]);
        });
    });
});
