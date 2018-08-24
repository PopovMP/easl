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

{let n 1}                     ; initialize a counter

(print (+ "Start from " n))

{while (<= n 10)              ; evaluate the condition
                              ; repeat the loop until the condition is true
    (print  "It is number" n) ; the 'while' loop body
    {set! n (+ n 1) }}        ; increase the counter and return back

(print (+ "The loop is not executed for: " n))
`
    },
    {
        name: "Random numbers in a list",
        code:
            `;; Random numbers in a list

{let lst (list.empty)}                    ; make an empty list

{for (i 0) (< i 10) (+ i 1)               ; cycle 10 times
    {let random   (* (math.random) 100)}  ; generate a random number between 0 and 100
    {let rounded  (math.round random)  }  ; round the number
    (list.add! rounded lst) }             ; add the number to the end of the list
    
(print lst) ; print the list
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
             ([0 2 4 6 8] "even")
             ([1 3 5 7 9] "odd" ) }}

(print n "is" type)
`
    },

    {
        name: "Function with default parameters",
        code:
            `;; Function with default parameters

{function sum (a b)
   {let a (or a 0)}
   {let b (or b 0)}
   {if (<= (list.length func-args) 2) 
       (+ a b)
       (+ a b (sum (list.get 2 func-args)
                   (list.get 3 func-args))) }}

(print "(sum)         →" (sum))
(print "(sum 1)       →" (sum 1))
(print "(sum 1 2)     →" (sum 1 2))
(print "(sum 1 2 3)   →" (sum 1 2 3))
(print "(sum 1 2 3 4) →" (sum 1 2 3 4)) ; Magic !?!
`
    },

    {
        name: "Implementation of 'map'",
        code:
            `;; Implementation of 'map' in EASL

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
(print lst)
`
    },

    {
        name: "Implementation of 'for-each'",
        code:
            `;; Implementation of 'for-each' in EASL

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

;; Each element is equal to the prev * 3
{let curr {lambda (prev) (* prev 3)}}

;; Recursive style
{function make-sequence-rec (first length next)
    {function loop (i res)
        {if (< i length)
            (loop (+ i 1) (list.add (next (list.last res)) res))
            res }}
    (loop 1 [first]) }

;; Iteration style
{function make-sequence-iter (first length next)
 	{let res [first]}
    {for (i 1) (< i length) (+ i 1)
    	(list.add! (next (list.last res)) res) }
    res }

(print "Recursive:" (make-sequence-rec  3 10 curr))
(print "Iteration:" (make-sequence-iter 3 10 curr))
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

    {
        name: "Message based OOP",
        code: `;; Demonstration of a message based OOP implemented with closure.

;; Person factory
{function make-person (first-name last-name)
    {lambda (message arg)
        {case message
            ("first name" (if (= (type-of arg) "string") (make-person arg  last-name) first-name))
            ("last name"  (if (= (type-of arg) "string") (make-person first-name arg) last-name ))
            ("clone"      (make-person first-name last-name))
            (else         (+ "I am " first-name " " last-name "!")) }}}

;; Create a person: John Smith
{let john-smith (make-person "John" "Smith")}

;; Get properties
(print (john-smith))
(print "My first name is:" (john-smith "first name"))
(print "My last name is:"  (john-smith "last name" ))

;; When set a property, the factory returns a new object
{let john-doe (john-smith "last name" "Doe")}
(print (john-doe))

;; clone an object
{let john-doe-clone (john-doe "clone")}

;; Change the first name of the clone
{let jane-doe (john-doe-clone "first name" "Jane")}
(print (jane-doe))
`
    },

    {
        name: "Unit testing with 'assert-lib'",
        code: `;; Unit tests

{import "https://raw.githubusercontent.com/PopovMP/easl/master/easl-libs/assert-lib.easl"}

(assert.equal (+ 2 3) 5 "Sum two numbers")

(assert.true? [1 2 3] "A non empty list is true.")

(assert.equal {if true  4 5} 4 "When the condition is true, 'if' returns the first expression")
(assert.equal {if false 4 5} 5 "When the condition is false, 'if' returns the second expression")

(assert.equal {if true  4 (print "I'M NOT PRINTED")} 4 "When the condition is true, 'if' evaluates only the first expression")
(assert.equal {if false (print "I'M NOT PRINTED") 5} 5 "When the condition is false, 'if' evaluates only the second expression")

;; The function is closed in 'lambda' to prevent pollution of the global scope
({lambda () {block
	{function sum (a b) (+ a b)}
    (assert.equal (sum 2 3) 5 "Call a function with two args.") }})

(assert.equal 13 42 "The answer to Life, the Universe, and Everything!")
`
    },
];
