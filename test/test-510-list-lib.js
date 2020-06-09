"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("list", function () {

    describe("list.push", function () {
        it("(list.push 1 2) → Error", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push 1 2)            `),
                "Error: 'list.push' requires array. Given: number 1");
        });
        it('(list.push "1" "2") Error', function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push "1" "2")        `),
                "Error: 'list.push' requires array. Given: string 1");
        });
        it("empty list:  (list.push '() 2) → [2]", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push '() 2)           `), [2]);
        });
        it(`empty list:  (list.push '() "2") → ["2"]`, function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push '() "2")         `), ["2"]);
        });
        it(`null:  (list.push null "2") → Error`, function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push null "2")       `),
                "Error: 'list.push' requires array. Given: object null");
        });
        it("non empty list:  (list.push '(1 2) 3) → '(1, 2, 3)", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push '(1 2) 3)         `), [1, 2, 3]);
        });
        it(`non empty list:  (list.push '("1" "2") "3") → '("1", "2", "3")`, function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.push (list "1" "2") "3")   `), ["1", "2", "3"]);
        });
        it(`two list:  (list.push '("1" "2") '("3" "4")) → '("1", "2", '("3", "4"))`, function () {
            assert.deepStrictEqual(easl.evaluate(`(list.push (list "1" "2") (list "3" "4"))`), ["1", "2", ["3", "4"]]);
        });
        it("it mutates the list", function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst '(1 2)}
             (list.push lst 3)    `), [1, 2, 3]);
        });
    });

    describe("list.concat", function () {
        it("concat two list of nums", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.concat '(1 2) '(3 4))     `), [1, 2, 3, 4]);
        });
        it("concat two list of strings", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.concat (list "1" "2") (list "3" "4"))     `), ["1", "2", "3", "4"]);
        });
    });

    describe("list.first", function () {
        it("(list.first 42) → Error", function () {
            assert.strictEqual(easl.evaluate(`   (list.first 42)        `),
                "Error: 'list.first' requires array. Given: number 42");
        });
        it("(list.first '()) → Error", function () {
            assert.strictEqual(easl.evaluate(`   (list.first '())        `),
                "Error: 'list.first' index operation of an empty list");
        });
        it("non empty list of nums", function () {
            assert.strictEqual(easl.evaluate(`   (list.first '(1 2 3))   `), 1);
        });
        it("non empty list of strings", function () {
            assert.strictEqual(easl.evaluate(`   (list.first (list "1" "2" "3"))   `), "1");
        });
    });

    describe("list.flatten", function () {
        it("flattens list of nums", function () {
            assert.deepStrictEqual(easl.evaluate(` (list.flatten (list (list 1 2) (list 3 4)))  `), [1, 2, 3, 4]);
        });
        it("flattens list of strings", function () {
            assert.deepStrictEqual(easl.evaluate(` (list.flatten (list (list "1" "2") (list "3" "4")))  `), ["1", "2", "3", "4"]);
        });
    });

    describe("list.get", function () {
        it("empty list", function () {
            assert.deepStrictEqual(easl.evaluate(` (list.get '() 0)  `),
                "Error: 'list.get' index operation of an empty list");
        });
        it("not list", function () {
            assert.deepStrictEqual(easl.evaluate(` (list.get 42 0)  `),
                "Error: 'list.get' requires array. Given: number 42");
        });
        it("first element of num list", function () {
            assert.deepStrictEqual(easl.evaluate(` (list.get '(1) 0)  `), 1);
        });
        it("last element of num list", function () {
            assert.deepStrictEqual(easl.evaluate(` (list.get '(1 2 3) 2)  `), 3);
        });
        it("first element of string list", function () {
            assert.deepStrictEqual(easl.evaluate(` (list.get '(a) 0)  `), "a");
        });
        it("last element of string list", function () {
            assert.deepStrictEqual(easl.evaluate(` (list.get '(a b c) 2)  `), "c");
        });
        it("out of range", function () {
            assert.deepStrictEqual(easl.evaluate(` (list.get '(1 2 3) 42)  `),
                "Error: 'list.get' list index out of range. Given: 42, list length 3");
        });
    });

    describe("list.index", function () {
        it("(list.index-of 1 2) → Error", function () {
            assert.strictEqual(easl.evaluate(`   (list.index-of 1 2)          `),
                "Error: 'list.index-of' requires array. Given: number 1");
        });
        it("(list.index-of null 1) → Error", function () {
            assert.strictEqual(easl.evaluate(`   (list.index-of null 1)       `),
                "Error: 'list.index-of' requires array. Given: object null");
        });
        it("(list.index-of '() 1) → -1", function () {
            assert.strictEqual(easl.evaluate(`   (list.index-of '() 1)         `), -1);
        });
        it("existing element:  (list.index-of '(1 2 3) 2) → 1", function () {
            assert.strictEqual(easl.evaluate(`   (list.index-of '(1 2 3) 2)    `), 1);
        });
        it("non existing element:  (list.index-of '(1 2) 3) → -1", function () {
            assert.strictEqual(easl.evaluate(`   (list.index-of '(1 2) 3)      `), -1);
        });
    });

    describe("list.join", function () {
        it(`empty list:  (list.join '()) → ""`, function () {
            assert.strictEqual(easl.evaluate(`   (list.join '())             `), "");
        });
        it(`default delimiter:  (list.join '(1 2 3)) → "1,2,3"`, function () {
            assert.strictEqual(easl.evaluate(`   (list.join '(1 2 3))        `), "1,2,3");
        });
        it(`custom delimiter:  (list.join '(1 2 3) "-") → "1-2-3"`, function () {
            assert.strictEqual(easl.evaluate(`   (list.join '(1 2 3) "-")    `), "1-2-3");
        });
    });

    describe("list.last", function () {
        it("not a list:  (list.last 42) → Error", function () {
            assert.strictEqual(easl.evaluate(`   (list.last 42)        `),
                "Error: 'list.last' requires array. Given: number 42");
        });
        it("empty list:  (list.last '()) → null", function () {
            assert.strictEqual(easl.evaluate(`   (list.last '())        `), null);
        });
        it("non empty list:  (list.last '(1 2 3)) → 3", function () {
            assert.strictEqual(easl.evaluate(`   (list.last '(1 2 3))   `), 3);
        });
    });

    describe("list.less", function () {
        it("not a list:  (list.less 42) → '()", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.less 42)        `),
                "Error: 'list.less' requires array. Given: number 42");
        });
        it("empty list:  (list.less '()) → '()", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.less '())        `), []);
        });
        it("list of one element:  (list.less '(1)) → '()", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.less '(1))        `), []);
        });
        it("list of nums", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.less '(1 2 3))   `), [1, 2]);
        });
        it("list of strings", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.less (list "1" "2" "3"))   `), ["1", "2"]);
        });
    });

    describe("list.length", function () {
        it("not a list:  (list.length 42) → -1", function () {
            assert.strictEqual(easl.evaluate(`   (list.length 42)        `),
                "Error: 'list.length' requires array. Given: number 42");
        });
        it("empty list:  (list.length '()) → 0", function () {
            assert.strictEqual(easl.evaluate(`   (list.length '())        `), 0);
        });
        it("non empty list:  (list.length '(1 2 3)) → 3", function () {
            assert.strictEqual(easl.evaluate(`   (list.length '(1 2 3))   `), 3);
        });
    });

    describe("list.unshift", function () {
        it("not a list:  (list.unshift 2 1) → '(1, 2)", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.unshift 2 1)            `),
                "Error: 'list.unshift' requires array. Given: number 2");
        });
        it("empty list:  (list.unshift '() 1) → '(1)", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.unshift '() 1)           `), [1]);
        });
        it("null:  (list.unshift null 1) → '(1)", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.unshift null 1)         `),
                "Error: 'list.unshift' requires array. Given: object null");
        });
        it("non empty list:  (list.unshift '(2 3) 1) → '(1, 2, 3)", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.unshift '(2 3) 1)        `), [1, 2, 3]);
        });
        it("two list:  (list.unshift '(3 4) '(1 2)) → '('(1, 2), 3, 4)", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.unshift '(3 4) '(1 2))    `), [[1, 2], 3, 4]);
        });
        it("it mutates the list", function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst '(2 3)}
             (list.unshift lst 1)
             lst                  `), [1, 2, 3]);
        });
    });

    describe("list.range", function () {
        it("(list.range 3 1) → '(1 2 3)", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.range 3 1)   `), [1, 2, 3]);
        });
        it("(list.range 1 3) → '(3)", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.range 1 3)   `), [3]);
        });
        it("(list.range 3 -1) → '(3)", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.range 3 -1)   `), [-1, 0, 1]);
        });
        it("(list.range 0 4) → '()", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.range 0 4) `), []);
        });
    });

    describe("list.reverse", function () {
        it("reverses a list", function () {
            assert.deepStrictEqual(easl.evaluate(`  
             (list.reverse '(3 2 1)) `), [1, 2, 3]);
        });
        it("mutates the original list", function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst '(3 2 1)}
             (list.reverse lst)
             lst                  `), [1, 2, 3]);
        });
    });

    describe("list.rest", function () {
        it("not a list:  (list.rest 42) → null", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.rest 42)        `), []);
        });
        it("empty list:  (list.rest (list)) → null", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.rest '())        `), []);
        });
        it("non empty list:  (list.rest (list 1 2 3)) → 3", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.rest '(1 2 3))   `), [2, 3]);
        });
    });

    describe("list.set", function () {
        it("set element:  (list.set '(1 2 3) 5 1) → '(1 5 3)", function () {
            assert.deepStrictEqual(easl.evaluate(`   (list.set '(1 2 3) 1 5)     `), [1, 5, 3]);
        });
        it("it mutates", function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst '(1 2 3)}
             (list.set lst 1 5)
             lst                  `), [1, 5, 3]);
        });
    });

    describe("list.slice", function () {
        it("called with no args, slices the whole list", function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst '(1 2 3 4 5)}
             (list.slice lst)           `), [1, 2, 3, 4, 5]);
        });
        it("called with one arg, slices from that index to the end", function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst '(1 2 3 4 5)}
             (list.slice lst 2)         `), [3, 4, 5]);
        });
        it("called with two args, slices from to (exclusive)", function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst '(1 2 3 4 5)}
             (list.slice lst 1 3)      `), [2, 3]);
        });
    });

    describe("list.sort", function () {
        it("sorts a list", function () {
            assert.deepStrictEqual(easl.evaluate(`  
             (list.sort '(3 1 2)) `), [1, 2, 3]);
        });
        it("mutates the original list", function () {
            assert.deepStrictEqual(easl.evaluate(`  
             {let lst '(3 2 1)}
             (list.sort lst)
             lst                  `), [1, 2, 3]);
        });
    });
});
