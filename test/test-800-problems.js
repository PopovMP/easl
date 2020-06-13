"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('problems', function () {

    it("Lambda calculus Tuple", function () {
        const actual = easl.evaluate(`   
            {let Tuple (a b)
               {λ (f) (f a b)} }

            {let first  (a b) a }
            {let second (a b) b }

            {let tuple (Tuple 1 2)}

            (tuple first)
        `);

        assert.deepStrictEqual(actual, 1);
    });

    it('Sequence generator', function () {
        assert.deepStrictEqual(easl.evaluate(`   
        (let make-sequence (first length next)
            (let res (list first))
            (let loop (index prev)
                (when (< index length)
                    (let new (next prev))
                    (list-push res new)
                    (loop (+ index 1) new)))
            (loop 1 first)
            res)
        
        (make-sequence 3 10 (λ (e) (* 3 e)))
            `),
            [3, 9, 27, 81, 243, 729, 2187, 6561, 19683, 59049]);
    });

    it('Swap elements of a list', function () {
        assert.deepStrictEqual(easl.evaluate(`   
            (let swap-on-place (lst i1 i2)
                (let temp (list-get lst i1))
                (list-set lst i1 (list-get lst i2))
                (list-set lst i2 temp))

            (let lst '(1 2 3 4))
            (swap-on-place lst 0 3)
            lst
                                                             `), [4, 2, 3, 1]);
    });

    it('"Find the maximum of a list', function () {
        assert.strictEqual(easl.evaluate(`   
            (let list-max (lst)
                (let loop (lst max)
                    (if lst
                        (loop (list-slice lst 1)
                              (math-max max (list-get lst 0)))
                        max))
                (loop lst (list-get lst 0)))
            
            (list-max '(42 34 12 5 62 2))
                                                             `), 62);
    });

});
