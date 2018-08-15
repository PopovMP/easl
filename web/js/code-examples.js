"use strict";

const examplesList = [
    {
        name: "List length",
        code:
`;; Define a variable 'lst' and assign a list to it
{let lst [1 2 3 4]}

;; Use the builtin function 'list.length' to take the length of the list
(list.length lst)
`
    },
    {
        name: "Swap list elements non destructive",
        code:
`;; Swap list elements non destructive

{let lst [1 2 3 4]}

{function swap (i1 i2 lst)
    (list.set (list.get i1 lst)
              i2
              (list.set (list.get i2 lst)
                        i1
                        lst)) }

(swap 0 3 lst)
`
    },

    {
        name: "Fibonacci - tail optimized",
        code:
`;; Fibonacci - tail optimized

{function fibo (n)
    {cond
        ((= n 1) 1)
        ((= n 2) 1)
        (else (loop n 2 1 1)) }}

{function loop (n i prev cur)
    {if (= i n)
        cur
        (loop n (+ i 1) cur (+ prev cur)) }}

(fibo 10)
`
    },
    {
        name: "Mutual recursion",
        code:
`;; Mutual recursion

{function is-even? (n)
    (or  (= n 0)
         (is-odd? (- n 1))) }

{function is-odd? (n)
    (and (!= n 0)
         (is-even? (- n 1))) }

(is-odd? 3)
`
    },
    {
        name: "Factorial",
        code:
`;; Factorial

{let fac
    {lambda (n)
        {if (= n 0)
            1
            (* n (fac (- n 1)))}}} 

(fac 5)
`
    },
    {
        name: "Find the maximum of a list",
        code:
`;; Find the maximum of a list

{function list-max (lst)
    (loop lst (list.first lst))}
    
{function loop (rest max)
    {if (list.empty? rest)
        max
        (loop (list.rest rest)
              (if (> (list.first rest)  max)
                  (list.first rest)
                  max)) }}


(list-max [42 34 12 5 62 2])
`
    },
    {
        name: "Closure example",
        code:
`;; Closure

{function make-adder (a)
    {lambda (b) (+ a b)}}

{let add2 (make-adder 2)}

(add2 3)
`   },
    {
        name: "Bubble sort",
        code:
`;; Bubble sort

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
    
(sort [6 5 10 9 8 7])
`
    },
    {
        name: "Y combinator - factorial",
        code:
            `;; Y combinator - factorial

(((lambda (!) (lambda (n) ((! !) n)))
  (lambda (!) (lambda (n) (if (= n 0)
                              1
                              (* ((! !) (- n 1))
                                 n))))) 5) 
`
    },
];
