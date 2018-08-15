"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('problems', function () {
    it('Geometric  progression', function () {
        assert.deepStrictEqual(easl.evaluate(`   
             
                                {function make-range (start length next)
                                    {function  loop (lst i)
                                        {if (= i length)
                                            lst
                                            (loop (list.add (next (list.last lst)) lst)
                                                  (+ i 1)) }}
                                    (loop [start] 1) }
                                          
                                  {make-range 3 10 {lambda (cur) (* cur 3)} )
                                  
                                              
                                                             `, false),
            [3, 9, 27, 81, 243, 729, 2187, 6561, 19683, 59049]);
    });


    it('Swap elements of a list', function () {
        assert.deepStrictEqual(easl.evaluate(`   
             

{let lst [1 2 3 4]}

{function swap (i1 i2 lst)
    (list.set (list.get i1 lst)
              i2
              (list.set (list.get i2 lst)
                        i1
                        lst)) }

(swap 0 3 lst)

                                              
                                                             `), [4, 2, 3, 1]);
    });

});
