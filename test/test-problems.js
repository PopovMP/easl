"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('problems', function () {

    describe('Fibonacci', function () {
        it('Fibonacci tail optimized', function () {
            assert.strictEqual(easl.evaluate(`   
             
                                  {let fib ( {n 10} )
                                    {let loop ( {i     2}
                                                {prev  1}
                                                {cur   1} )
                                      {if (= i n)
                                          cur
                                          (loop (+ i 1) cur (+ prev cur)) }}}
                                              
                                                                                            `), 55);
        });
    });


    describe('List sum', function () {
        it('Sum elements tail optimized', function () {
            assert.strictEqual(easl.evaluate(`   
             
                                  {let list.sum { (lst [1 2 3 4 5 6 7 8 9]) }
                                    {let loop { (i   (list.length lst))
                                                (sum 0) }
                                      {if (= i -1)
                                          sum
                                          (loop (- i 1) (+ (list.get i lst) sum) ) }}}
                                              
                                                                                            `), 45);
        });
    });

    describe('Make sequences', function () {
        it('Range', function () {
            assert.deepStrictEqual(easl.evaluate(`   
             
                                  {let make-range { (start     0)
                                                    (length   10)
                                                    (next     {lambda (cur) (+ cur 1)}) }
                                    {let loop { (lst  [start]) ;; The list starts with the first element
                                                (i    1) }     ;; The teh loop starts from index = 1
                                      {if (= i length)
                                          lst
                                          (loop (list.add (next (list.last lst)) lst)
                                                (+ i 1)) }}}
                                              
                                                                       `), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });


        it('Arithmetic progression', function () {
            assert.deepStrictEqual(easl.evaluate(`   
             
                                  {let make-range { (start     0)
                                                    (length   10)
                                                    (next     {lambda (cur) (+ cur 10)}) }
                                    {let loop { (lst  [start])
                                                (i    1) }
                                      {if (= i length)
                                          lst
                                          (loop (list.add (next (list.last lst)) lst) (+ i 1)) }}}
                                              
                                                                       `), [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
        });


        it('Geometric  progression', function () {
            assert.deepStrictEqual(easl.evaluate(`   
             
                                  {let make-range { (start     3)
                                                    (length   10)
                                                    (next     {lambda (cur) (* cur 3)}) }
                                    {let loop { (lst  [start])
                                                (i    1) }
                                      {if (= i length)
                                          lst
                                          (loop (list.add (next (list.last lst)) lst) (+ i 1)) }}}
                                              
                                                             `), [3, 9, 27, 81, 243, 729, 2187, 6561, 19683, 59049]);
        });


        it('Swap elements of a list', function () {
            assert.deepStrictEqual(easl.evaluate(`   
             

{define lst [1 2 3]}

{define swap {lambda (i1 i2 lst)
                (list.set (list.get i1 lst)
                          i2
                          (list.set (list.get i2 lst)
                                    i1
                                    lst)) }}

(swap 0 2 lst)

                                              
                                                             `), [3, 2, 1]);
        });

    });


});
