"use strict";

const examplesList = [
    {
        name: "List length",
        code:
            `;; Define a variable 'lst' and
;; assign a list to it

{let lst [1 2 3 4]}

;; Use the builtin function 'list.length'
;; to take the length of the list

(list.length lst)

;; Try to uncomment some of the expressions below
; (list.first lst)
; (list.rest lst)
; (list.last lst)
`
    },
    {
        name: "Print numbers from 1 to 10",
        code:
            `;; Print numbers from 1 to 10

{let n 1 }                         ; initialize a counter

(print (+ "Start from " n))

{while (<= n 10)                   ; evaluate the condition
                                   ; repeat the loop until the condition is true
    (print  (+ "It is number " n)) ; the 'while' loop body
    {set! n (+ n 1)} }             ; increase the counter and return back

(print (+ "The loop is not executed for: " n))
`
    },
    {
        name: "Random numbers in a list",
        code:
            `;; Random numbers in a list

{let lst (list.empty)}                    ; make an empty list

{for (i 0) (< i 10) (+ i 1)               ; cycle 10 times
    {let rand-num (* (math.random) 100)}  ; generate a random number between 0 and 100
    {let rounded  (math.round rand-num)}  ; round the number
    (list.add! rounded lst) }             ; add the number to the end of the list
    
{print lst) ; print the list
`
    },

    {
        name: "Odd or even with 'case'",
        code:
            `;; Odd or even with 'case'

; Generate a random number between 0 and 9
{let n (math.floor (* (math.random) 10)) }

; Check which list of options contains the value of 'n' and return the text.
{let type {case n
             ([0 2 4 6 8] " is even")
             ([1 3 5 7 9] " is odd" ) }}

(print (+ n type))
`
    },

    {
        name: "Function with default parameters",
        code:
            `;; Function with default parameters

{function sum (a b)
   {let a (or a 0)} ; If 'a' is not given, it is set to 0
   {let b (or b 0)} ; If 'b' is not given, it is set to 0

   (+ a b) }

(print "(sum)     →" (sum))
(print "(sum 1)   →" (sum 1))
(print "(sum 1 2) →" (sum 1 2))
`
    },

    {
        name: "Implementation of 'map'",
        code:
            `;; Implementation of 'map'

{function map (func lst)
    {let i    0}    
    {let len (list.length lst)}
    {let res []}

    {while (< i len)
         (list.add! (func (list.get i lst)) res)
         (set! i (+ i 1))}

    res}

{let range (list.range 1 10)}              ;; Make a range form 1 to 10
{let lst (map {lambda (e) (* e 2)} range)} ;; Double each element 
`
    },

    {
        name: "Implementation of 'for-each'",
        code:
            `;; Implementation of for-each

{function for-each (func lst)
    {let len (list.length lst)}
    {let i   0}

    {while (< i len)
         (func (list.get i lst))
         (set! i (+ i 1))} }

{let printer {lambda (e) (print e)} }
{let range   (list.range 1 10) }

(for-each printer range)
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
        name: "Factorial",
        code:
            `;; Factorial

{function fac (n)
    {if (= n 0)
        1
        (* (fac (- n 1)) n) }} 

(fac 5)
`
    },

    {
        name: "Fibonacci - tail optimized",
        code:
            `;; Fibonacci - tail optimized

{function fibo (n)
    {function loop (i prev cur)
        {if (= i n)
            cur
            (loop (+ i 1) cur (+ prev cur)) }}

    {cond
        ((= n 1) 1)
        ((= n 2) 1)
        (else (loop 2 1 1)) }}

(fibo 10)
`
    },
    {
        name: "Mutual recursion",
        code:
            `;; Mutual recursion

{function is-even? (n)
    {or  (= n 0)
         (is-odd? (- n 1)) }}

{function is-odd? (n)
    {and (!= n 0)
         (is-even? (- n 1)) }}

(is-odd? 3)
`
    },


    {
        name: "Find the maximum of a list",
        code: `;; Find the maximum of a list

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
        code: `;; Closure

{function make-adder (a)
    {lambda (b) (+ a b)}}

{let add2 (make-adder 2)}

(add2 3)
`
    },
    {
        name: "Sequence generator",
        code: `;; Sequence generator

{function make-sequence (first length next)
    {function loop (lst i)
        {if (= i length)
            lst
            (loop (list.add (next (list.last lst)) lst)
                  (+ i 1)) }}
    (loop [first] 1) }                       ; start the loop with the first element preset.


{make-sequence 3                             ; the first element
               10                            ; the sequence length
               {lambda (prev) (* prev 3)} )  ; calculation formula
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

    {
        name: "Bubble sort Scheme-like",
        code: `;; Bubble sort Scheme-like

;; Loads scheme library
{import "https://raw.githubusercontent.com/PopovMP/easl/master/easl-libs/scheme-lib.easl"}

{function bubble-up (lst)
{if (empty? (cdr lst))
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
    (bubble-sort-aux (length lst) lst) }

(sort (list 6 5 10 9 8 7))
`
    },

    {
        name: "EASL interprets EASL",
        code: `;; EASL interprets EASL

;; EASL source code in a string
{let code-text "{let lst [1 2 3 4 5 6 7]} {let len (list.length lst)} (* 6 len)"}

;; Code parsed to EASL intermediate code
{let code-tree (parse code-text)}

;; Evaluation of the code tree
{let res (eval code-tree)}

(print "The answer is:" res)
`
    },
];
