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
            {let make-sequence (start length next)
                    {let loop (lst i)
                        {if (= i length)
                            lst
                            (loop (list.add lst (next (list.last lst))) (+ i 1)) }}
                    (loop (list start) 1) }
            
              {make-sequence 3 10 {λ (cur) (* cur 3)} )
            `),
            [3, 9, 27, 81, 243, 729, 2187, 6561, 19683, 59049]);
    });

    it('Swap elements of a list', function () {
        assert.deepStrictEqual(easl.evaluate(`   
            {let swap (lst i1 i2)
                {let temp (list.get lst i1)}
                (list.set lst i1 (list.get lst i2))
                (list.set lst i2 temp) }

            (swap '(1 2 3 4) 0 3)
                                                             `), [4, 2, 3, 1]);
    });

    it('"Find the maximum of a list', function () {
        assert.strictEqual(easl.evaluate(`   
            {let list-max (lst)
            
              {let loop (lst max)
                {if lst
                    (loop (list.rest lst) (math.max max (list.first lst)))
                    max }}
            
              (loop lst (list.first lst)) }
            
            (list-max '(42 34 12 5 62 2))
                                                             `), 62);
    });

});
