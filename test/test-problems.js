"use strict";

const assert = require("assert");
const Application = require("../bin/easl.js").Application;

const app = new Application();

describe('problems', function () {

    describe('Fibonacci', function () {
        it('Fibonacci tail optimized', function () {
            assert.strictEqual(app.evaluate(`   
             
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
            assert.strictEqual(app.evaluate(`   
             
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
            assert.deepStrictEqual(app.evaluate(`   
             
                                  {let make-range { (start     0)
                                                    (length   10)
                                                    (next     {lambda (cur) (+ cur 1)}) }
                                    {let loop { (lst  [start])
                                                (i    1) }
                                      {if (= i length)
                                          lst
                                          (loop (list.add (next (list.last lst)) lst) (+ i 1)) }}}
                                              
                                                                       `), [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]);
        });


        it('Arithmetic progression', function () {
            assert.deepStrictEqual(app.evaluate(`   
             
                                  {let make-range { (start     0)
                                                    (length   10)
                                                    (next     {lambda (cur) (+ cur 10)}) }
                                    {let loop { (lst  [start])
                                                (i    1) }
                                      {if (= i length)
                                          lst
                                          (loop (list.add (next (list.last lst)) lst) (+ i 1)) }}}
                                              
                                                                       `), [ 0, 10, 20, 30, 40, 50, 60, 70, 80, 90 ]);
        });



        it('Geometric  progression', function () {
            assert.deepStrictEqual(app.evaluate(`   
             
                                  {let make-range { (start     3)
                                                    (length   10)
                                                    (next     {lambda (cur) (* cur 3)}) }
                                    {let loop { (lst  [start])
                                                (i    1) }
                                      {if (= i length)
                                          lst
                                          (loop (list.add (next (list.last lst)) lst) (+ i 1)) }}}
                                              
                                                             `), [ 3, 9, 27, 81, 243, 729, 2187, 6561, 19683, 59049 ]);
        });

    });


});
