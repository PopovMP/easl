"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

// source: https://stackoverflow.com/a/21841926/926841
it('Bubble sort', function () {
    assert.deepStrictEqual(easl.evaluate(`   

{function bubble-up (lst)
    {if (list.empty? (cdr lst))   
        lst    
        {if (< (car lst) (cadr lst))   
            (cons (car  lst) (bubble-up (cdr lst)))   
            (cons (cadr lst) (bubble-up (cons (car lst)
                                              (cddr lst)))) }}}

{function bubble-sort-aux (n lst)
    {if (= n 1)
        (bubble-up lst)
        (bubble-sort-aux (- n 1)
                         (bubble-up lst)) }} 

{function sort (lst) 
    (bubble-sort-aux (list.length lst) lst) }
  
(sort (list 6 5 10 9 8 7))
                                              
                                                             `, false),
        [5,6,7,8,9,10]);
});
