"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('let lambda - recursive', function () {

    it('count of list elements', function () {
        assert.strictEqual(easl.evaluate(`   

            {let count {lambda (lst cnt)
                           {if ((list.length lst) = 0)
                               cnt
                               (count (list.rest lst)
                                      (cnt + 1) )}}}
            
            (count [1 2 3 4 5] 0)
                                                  
                                                    `), 5);
    });


    it('factorial 5  → 120', function () {
        assert.strictEqual(easl.evaluate(` 
  
            {let fac
                {lambda n
                    {if (> n 0)
                        (* n (fac (- n 1)))
                        1 }}} 
            
            (fac 5)
                                                    `), 120);
    });


    it('fibonacci tail optimized', function () {
        assert.strictEqual(easl.evaluate(` 

            {let fibo {lambda n
                (loop n 2 1 1)}}
    
            {let loop {lambda (n i prev cur)
                        {if (= i n)
                            cur
                            (loop n (+ i 1) cur (+ prev cur))}}}
    
            (fibo 10)        
        
                                                    `), 55);
    });


    it('mutual recursion', function () {
        assert.strictEqual(easl.evaluate(`  

            {let is-even? (lambda n (or (= n 0)
                                        (is-odd? (- n 1))))}
            
            {let is-odd?  (lambda n (and (!= n 0)
                                         (is-even? (- n 1))))}
            
            (is-odd? 3)   
                                                    `), true);
    });
});
