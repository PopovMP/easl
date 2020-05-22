"use strict";

const examplesList = [
    {
        name: "Print numbers from 1 to 10",
        code: `;; Print numbers from 1 to 10

(let n 1)       ; initialize a counter
(while (< n 6)  ; evaluate the condition
    (print n)   ; the 'while' loop body
    (inc   n) ) ; increment the counter
`
    },

    {
        name: "Working with lists",
        code: `;; We define a list in square brackets.
(let lst (list 0 1 2 3))

(print "A list of numbers         :" lst)
(print "The list length           :" (list.length lst))
(print "The first element         :" (list.first  lst))
(print "All but first one         :" (list.rest   lst))
(print "The last element          :" (list.last   lst))
(print "All but the last one      :" (list.less   lst))
(print "The third element         :" (list.get    lst 2))
(print "From the 2nd to the 4th   :" (list.slice  lst 1 4))
(print "Add an element to the end :" (list.add    lst 4))
(print "Set 1st element on place  :" (list.set    lst 0 2))
(print "Push one elem in front    :" (list.push   lst 3))
(print "Get a sorted list         :" (list.sort   lst))

`
    },

    {
        name: "Random numbers in a list",
        code: `;; Random numbers in a list

(let lst '())                            ; make an empty list

(repeat 10                              ; cycle 10 times
    (let random  (* (math.random) 100)) ; generate a random number between 0 and 100
    (let rounded (math.round random)  ) ; round the number
    (list.add lst rounded) )            ; add the number to the end of the list
    
(print lst) ; print the list
`
    },

    {
        name: "Odd or even with 'case'",
        code: `;; Odd or even with 'case'

; Generate a random number between 0 and 9
(let n (math.floor (* 10 (math.random))) )

; Checks which list of options contains the value of 'n' and returns the text.
(let type (case n
             ('(0 2 4 6 8) "even")
             ('(1 3 5 7 9) "odd" ) ))

(print n "is" type)
`
    },

    {
        name: "First class citizens",
        code: `;; First class citizens

(let a 12)
(let b 24)

;; Imperative way - most of the Programming Languages (PLs) can do that
(let d 0)
(if (> a  b)
    (set d (- a b))
    (set d (+ a b)) )
(print d)

;; A better way - some of the PLs can do that
(print (if (> a b) (- a b) (+ a b)))

;; The masters way - how many PLs can do that?
(print ((if (> a b) - +) a b))
`
    },

    {
        name: "Function with default parameters",
        code: `;; Function with default parameters

(function sum (a b)
   (unless a (set a 0))
   (unless b (set b 0))
   (+ a b) )

(print "(sum)         →" (sum))
(print "(sum 1)       →" (sum 1))
(print "(sum 1 2)     →" (sum 1 2))
(print "(+ 1 2 3 4 5) →" (+ 1 2 3 4 5)) ; The EASL way :)
`
    },

    {
        name: "Implementation of 'map'",
        code: `;; Implementation of 'map' in EASL

(function map (func lst)
    (let i    0)    
    (let len (list.length lst))
    (let res '())

    (while (< i len)
         (list.add res (func (list.get lst i)))
         (inc i) )

    res)

(let range (list.range 1 10))       ;; Make a range form 1 to 10
(let lst (map (λ (e) (* e 2)) range)) ;; Double each element 
(print lst)
`
    },

    {
        name: "Implementation of 'for-each'",
        code: `;; Implementation of 'for-each' in EASL

(function for-each (func lst)
    (let len (list.length lst))
    (let i   0)

    (while (< i len)
         (func (list.get lst i))
         (inc i) ))

(let printer (λ (e) (print e)))
(let range   (list.range 1 10))

(for-each printer range)
`
    },

    {
    name: "Swap list elements",
    code:
    `;; Swap list elements

(let lst (list 1 2 3 4))

(function swap (lst i1 i2)
    (let temp (list.get lst i1))
    (list.set lst i1 (list.get lst i2))
    (list.set lst i2 temp) )

(print "Original:" lst)
(print "Swapped :" (swap lst 0 3))
`
    },

    {
        name: "Factorial",
        code: `;; Factorial

(function fac (n)
    (if (= n 0)
        1
        (* n (fac (- n 1))) )) 

(print (fac 5))
`
    },
    {
        name: "FizzBuzz shortest solution",
        code: `; Write a program that prints the numbers from 1 to 100.
; But for multiples of three print "Fizz" instead of the number and
; for the multiples of five print "Buzz".
; For numbers which are multiples of both three and five print "FizzBuzz".

(for i (list.range 1 100)
    (print (or (+ (if (% i 3) "" "Fizz")
                  (if (% i 5) "" "Buzz"))
               i )) )
`
    },

    {
        name: "FizzBuzz recursive style",
        code: `;; FizzBuzz recursive style

(function get-fizz-buzz (n)
    (cond
        ((not (% n 15)) "FizzBuzz")
        ((not (% n  3)) "Fizz"    )
        ((not (% n  5)) "Buzz"    )
        (else n) ))

(function FizzBuzz (max)
    (function loop (n res)
        (if (<= n max)
            (loop (+ n 1)
                  (list.add res
                            (get-fizz-buzz n)))
            res ))
    (loop 1 '()) )

(print (FizzBuzz 100))
`    },

    {
        name: "Fibonacci - tail optimized",
        code: `;; Fibonacci - tail optimized

(function fibo (n)
    (function loop (i prev cur)
        (if (= i n)
            cur
            (loop (+ i 1) cur (+ prev cur)) ))
    (case n
        ((1 2) 1)
        (else (loop 2 1 1)) ))

;; Print
(for i (list.range 1 10)
    (print "fibo" i ":" (fibo i)) )
`   },

    {
        name: "Mutual recursion",
        code: `;; Mutual recursion

(function is-even (n)
    (or (= n 0)
        (is-odd (- n 1)) ))

(function is-odd (n)
    (and (!= n 0)
         (is-even (- n 1)) ))

(let n (math.ceil (* 100 (math.random))))
(let odd-even (if (is-odd n) "odd" "even"))
(print n "is" odd-even)
`
    },

    {
        name: "Benchmark: for, call, recursion",
        code: `;; Benchmark: for, call, recursion
;; Calculate the sum of a list by using three different methods

;; Use "for" loop over the given list
(function sum-list-for (lst)
    (let sum 0)
    (for n lst
        (inc sum n) )
    sum )

;; Call "+" on each elements of the list
(function sum-list-call (lst)
    (call + lst) )

;; Tail optimised recursion
(function sum-list-rec (lst)
    (function loop (acc rest)
        (if rest
            (loop (+ acc (list.first rest))
                  (list.rest rest))
            acc ))
    (loop 0 lst) )

;; Benchmark function
(function benchmark (func lst times method)
    (let start-time (date.now))

    (repeat times (func lst))
 
    (let time (/ (- (date.now) start-time) 1000))
    (let res  (func lst))
    (print "Using:" method "Res:" res "Time:" time) )

;; Make a list from 1 to N inclusively
(let lst-nums (list.range 1 100)) ;; Try with 10, 100, or 1000 elements

(let rounds 1000)

(benchmark sum-list-for  lst-nums rounds "for ")
(benchmark sum-list-call lst-nums rounds "call")
(benchmark sum-list-rec  lst-nums rounds "rec ")
`
    },

    {
        name: "Find the maximum of a list",
        code: `;; Find the maximum of a list recursively

(function list-max (lst)

  (function loop (lst max)
    (if lst
        (loop (list.rest lst) (math.max max (list.first lst)))
        max ))

  (loop lst (list.first lst)) )

(let lst '(42 34 12 5 62 2))
(print "List   : " lst)
(print "Maximum: " (list-max lst))
`
    },

    {
        name: "Eliminate consecutive duplicates",
        code: `;; Eliminate consecutive duplicates

(function clean (lst)
    (function loop (rest acc)
         (if rest
             (if (= (list.first rest) (list.last acc))
                 (loop (list.rest rest) acc)
                 (loop (list.rest rest)
                       (list.add acc (list.first rest))) )
             acc ))
    (loop (list.rest lst) (list (list.first lst))) )

(print (clean '(0 1 1 2 3 4 5 5 5 6 7 7 8 8 8 9 9 9)))
`
    },

    {
        name: "Higher order functions",
        code: `;; Higher order functions for Lists

; The source code of the list HOF is at the link below
; https://github.com/PopovMP/easl/blob/master/public/easl/list-hof.easl
(import "https://raw.githubusercontent.com/PopovMP/easl/master/public/easl/list-hof.easl")

(let lst '(1 2 3 4 5))

; (list.reduce lst (λ (element accumulator index) (...)) initial-value) 
(let sum (list.reduce lst (λ (e acc) (+ e acc))  0) )
(print "sum elem" sum)


; (list.map lst (λ (element index) (...)))
(let doubled (list.map lst (λ (e) (* 2 e))))

(print "doubled" doubled)

; (list.for-each lst (λ (element index) (...)))
(list.for-each lst (λ (e i) (print (str.repeat " " (- (list.length lst) i)) e)))


; (list.filter lst (λ (element index) (...)))
(let odd (list.filter lst (λ (e) (and (% e 2) e))))

(print "odd elem" odd)


; (list.any lst (λ (element index) (...)))
(let has-gt-3 (list.any lst (λ (e) (> e 3))))

(print "has elem > 3" has-gt-3)


; (list.all lst (λ (element index) (...)))
(let all-gt-3 (list.all lst (λ (e) (> e 3))))

(print "all elem > 3" all-gt-3)
 
`
    },

    {
        name: "Hanoi tower",
        code: `;; Hanoi tower

(function move (from to)
    (print "Move disk from" from "to" to) )

(function solve (n from to through)
    (when (> n 0)
          (solve (- n 1) from through to)
          (move from to)
          (solve (- n 1) through to from) ))

(solve 4 "A" "C" "B")

`
    },

    {
        name: "Closure adder",
        code: `;; Closure adder

(function make-adder (a)
    (λ (b) (+ a b) ))

(let add2 (make-adder 2))

(print (add2 3))
`
    },

    {
        name: "Closure counter",
        code: `;; Closure counter

(function make-counter (value delta)
    (set value (or value 0))   ; sets a default initial value
    (set delta (or delta 1))   ; sets a default delta 
    (dec value delta)          ; applies an opposite delta to guarantee the same initial value
    (λ () (inc value delta)) ) ; returns the counter function (closure)

(let count (make-counter))
(print (count) (count) (count) (count))

(let count10  (make-counter 0 10))
(print (count10) (count10) (count10) (count10))

(let counter (make-counter 4 -1))
(while (counter) (print "***"))
`   },

    {
        name: "Sequence generator",
        code: `;; Sequence generator

;; Each element is equal to the prev * 3
(let curr (λ (prev) (* prev 3)))

;; Recursive style
(function make-sequence-rec (first length next)
    (function loop (i res)
        (if (< i length)
            (loop (+ i 1) (list.add res (next (list.last res))))
            res ))
    (loop 1 (list first)) )

;; Iteration style
(function make-sequence-iter (first length next)
 	(let res (list first))
    (repeat (- length 1)
    	(list.add res (next (list.last res))) )
    res )

(print "Recursive:" (make-sequence-rec  3 10 curr))
(print "Iteration:" (make-sequence-iter 3 10 curr))
`
    },

    {
        name: "Y combinator - factorial",
        code: `;; Y combinator - factorial

(((λ (f)
     (λ (n)
        ((f f) n) ))
  (λ (f)
     (λ (n)
        (if (= n 0)
            1
            (* n ((f f) (- n 1))) )))) 5)
`   },

    {
        name: "EASL interprets EASL",
        code: `;; EASL source code in a string
(let src "
    (let lst '(1 2 3 4 5 6 7))
    (let len (list.length lst))
    (* 6 len)
" )

(let ilc (parse src)) ; Parse the source code to intermediate language
(let res (eval  ilc)) ; Eval the intermediate language

(print "The answer is:" res)
`
    },

    {
        name: "OOP - List based",
        code: `;; OOP - List based

(enum .fname .lname .age)

(function person.new (fname lname age)
     (list fname lname age) )

(function person.clone (person) (list.slice person) )
(function person.grow  (person) (list.set person .age (+ (list.get person .age) 1)) )
(function person.name  (person) (+ (list.get person .fname) " " (list.get person .lname)) )

(let john (person.new "John" "Doe" 33))
(print john)
(person.grow john)
(print (list.get john .fname) "is now" (list.get john .age))
`
    },

    {
        name: "OOP - Message based",
        code: `;; Demonstration of a message based OOP implemented with closure.

;; Person's attributes
(enum .first-name .last-name .clone)

;; Person factory
(function make-person (first-name last-name)
    (lambda (action value)
        (cond
            ((= action .first-name) 
                  (if value (make-person value  last-name) first-name))
            ((= action .last-name)
                  (if value (make-person first-name value) last-name ))
            ((= action .clone)
                  (make-person first-name last-name)                  )
            (else (+ "I am " first-name " " last-name "!")            ) )))

;; Create a person: John Smith
(let john-smith (make-person "John" "Smith"))

;; Get properties
(print (john-smith))
(print "My first name is:" (john-smith .first-name))
(print "My last name is :" (john-smith .last-name ))

;; When set a property, the factory returns a new object
(let john-doe (john-smith .last-name "Doe"))
(print (john-doe))

;; clone an object
(let john-doe-clone (john-doe .clone))

;; Change the first name of the clone
(let jane-doe (john-doe-clone .first-name "Jane"))
(print (jane-doe))

`   },

    {
        name: "OOP - Lambda Calculus style",
        code: `;; OOP - Lambda Calculus style

(function Person (name age)
   (λ (f)
      (f name age (λ ()
                     (inc age) )) ))

(function name (name) name )
(function age  (name age) age )
(function who  (name age) (print name age))
(function grow (name age grow) (grow))

(let john (Person "John" 33))
(john grow)
; (john who)

(function Singer (person)
   (λ (f)
      (f person (λ (song) (print "🎵" song))) ))

(function person (person) person)
(function sing   (person sing) sing)

(let johnSinger (Singer john))
((johnSinger person) who)
((johnSinger sing) "Tra la la")
`
    },

    {
        name: "Unit testing with 'assert-lib'",
        code: `;; Unit tests

; Assert lib: https://github.com/PopovMP/easl/blob/master/public/easl/assert.easl
(import "https://raw.githubusercontent.com/PopovMP/easl/master/public/easl/assert.easl")

(assert.equal (+ 2 3) 5 "Sum two numbers")

(assert.true? '(1 2 3) "A non empty list is true.")

(assert.equal (if true  4 5) 4
              "When the condition is true, 'if' returns the first expression")
(assert.equal (if false 4 5) 5
              "When the condition is false, 'if' returns the second expression")

(assert.equal (if true  4 (print "I'M NOT PRINTED")) 4
              "When the condition is true, 'if' evaluates only the first expression")
(assert.equal (if false (print "I'M NOT PRINTED") 5) 5
              "When the condition is false, 'if' evaluates only the second expression")

;; The function is closed in 'lambda' to prevent pollution of the global scope
((lambda ()
	(function sum (a b) (+ a b))
    (assert.equal (sum 2 3) 5 "Call a function with two args.") ))

(assert.equal 13 42 "The answer to Life, the Universe, and Everything!")
`
    },

    {
        name: "Lambda Calculus",
        code: `;; Lambda Calculus

;; Lambda Calculus

;; Boolean logic

(let TRUE  (λ (x) (λ (y) x)))
(let FALSE (λ (x) (λ (y) y)))
(let NOT   (λ (p) ((p FALSE) TRUE) ))
(let AND   (λ (p) (λ (q) ((p q) p) )))
(let OR    (λ (p) (λ (q) ((p p) q) )))
(let IF    (λ (p) (λ (x) (λ (y) ((p x) y) )))) 

;; Alonso Church numbers representation

(let zero  (λ (f) (λ (x) x )))
(let one   (λ (f) (λ (x) (f x) )))
(let two   (λ (f) (λ (x) (f (f x)) )))
(let three (λ (f) (λ (x) (f (f (f x))) )))
(let four  (λ (f) (λ (x) (f (f (f (f x)))) )))
(let five  (λ (f) (λ (x) (f (f (f (f (f x))))) )))
(let six   (λ (f) (λ (x) (f (f (f (f (f (f x)))))) )))
(let seven (λ (f) (λ (x) (f (f (f (f (f (f (f x))))))) )))
(let eight (λ (f) (λ (x) (f (f (f (f (f (f (f (f x)))))))) )))
(let nine  (λ (f) (λ (x) (f (f (f (f (f (f (f (f (f x))))))))) )))
(let ten   (λ (f) (λ (x) (f (f (f (f (f (f (f (f (f (f x)))))))))) )))

;; Algebra 

(let succ     (λ (n) (λ (f) (λ (x) (f ((n f) x)) ))))
(let pred     (λ (n) (λ (f) (λ (x) (((n (λ (g) (λ (h) (h (g f))))) (λ (u) x)) (λ (u) u)) ))))

(let add      (λ (m) (λ (n) ((m succ) n) )))
(let sub      (λ (m) (λ (n) ((n pred) m) )))

(let mult     (λ (m) (λ (n) (λ (f) (m (n f)) ))))
(let power    (λ (m) (λ (n) (n m) )))

(let zero?    (λ (n) ((n (λ (x) FALSE)) TRUE) ))
(let lte?     (λ (m) (λ (n) (zero? ((sub m) n)) )))

;; Converts a Church number to an integer
(let int  (λ (cn) ((cn (λ (n) (+ n 1))) 0)))

;; Converts a Church boolean to bool
(let bool (λ (cb) ((cb true) false) ))

;; Examples
(print "one =" (int one))

(let forty-two ((add ((mult ten) four)) two))
(print "forty-two =" (int forty-two))

;; Boolean logic
(print)
(print "(not  true) =>" (bool (NOT  TRUE)))
(print "(not false) =>" (bool (NOT FALSE)))
(print)
(print "((true  one) two) =>" (int ((TRUE  one) two)))
(print "((false one) two) =>" (int ((FALSE one) two)))
(print)
(print "((and  true)  true) =>" (bool ((AND  TRUE)  TRUE)))
(print "((and false)  true) =>" (bool ((AND FALSE)  TRUE)))
(print "((and  true) false) =>" (bool ((AND  TRUE) FALSE)))
(print "((and false) false) =>" (bool ((AND FALSE) FALSE)))
(print)
(print "((or  true)   true) =>" (bool ((OR  TRUE)  TRUE)))
(print "((or false)   true) =>" (bool ((OR FALSE)  TRUE)))
(print "((or  true)  false) =>" (bool ((OR  TRUE) FALSE)))
(print "((or false)  false) =>" (bool ((OR FALSE) FALSE)))
(print)
(print "(((if  true) one) two) =>" (int (((IF  TRUE) one) two)))
(print "(((if false) one) two) =>" (int (((IF FALSE) one) two)))
(print)

;; Factorial
(let fac (λ (n) ((IF ((((lte? n) one)
                     (λ () one))
                     (λ () ((mult n) (fac (pred n)))) ))) ))

(print "factorial 5 =" (int (fac five)))

;; Fibonacci
(let fib (λ (n) ((IF ((((lte? n) one)
                     (λ () one))
                     (λ () ((add (fib ((sub n) one)))
                                 (fib ((sub n) two)))) ))) ))

(print "Fibonacci 9 =" (int (fib nine)))

`
    },

    {
        name: "BrainFuck Interpreter",
        code: `;; BrainFuck Interpreter

(let code-text  "

   Adds two digits from the input
   ,>++++++[<-------->-],[<+>-]<.
 
")

(let input-text "34")

(let code-list '())
(for ch (str.split code-text)
   (if (list.has (list "+" "-" ">" "<" "," "." "[" "]") ch)
       (list.add code-list ch) ))

(let code-index  0)
(let code-len (list.length code-list))

(let input-index 0)
(let input-list (str.split input-text))

(let buffer '(0))
(let pointer  0)
(let command "")
(let output  "")
(let steps    0)

(while (< code-index code-len)
    ;; Read the current command.
    (set command (list.get code-list code-index))
    (inc code-index)
    (inc steps)
 
    (case command
        ;; Increment the pointer.
        ((">") (inc pointer)
             (if (= (list.length buffer) pointer)
                 (list.add buffer 0) ))

        ;; Decrement the pointer.
        (("<") (if (> pointer 0)
                 (dec pointer)
                 (print "Error: pointer < 0")))

        ;; Increment the byte at the pointer.
        (("+") (list.set buffer pointer
                     (+ (list.get buffer pointer) 1) ))

        ;; Decrement the byte at the pointer.
        (("-") (list.set buffer pointer
                     (- (list.get buffer pointer) 1) ))

        ;; Output the byte at the pointer.
        ((".") (set output (+ output
                            (str.from-char-code (list.get buffer pointer))) ))

        ;; Input a byte and store it in the byte at the pointer.
        ((",") (let input (list.get input-list input-index))
             (inc input-index)
             (list.set buffer pointer
                     (if (= (type-of input) "string")
                         (str.char-code-at input 0)
                         0 )))

        ;; Jump forward past the matching ] if the byte at the pointer is zero.
        ("[" (when (= (list.get buffer pointer) 0)
                   (let depth 1)
                   (while (> depth 0)
                          (set command (list.get code-list code-index))
                          (inc code-index)
                          (case command
                              ("[" (inc depth))
                              ("]" (dec depth)) ))))

        ;; Jump backward to the matching [ unless the byte at the pointer is zero.
        ("]" (when (not (= (list.get buffer pointer) 0))
                   (let depth 1)
                   (dec code-index 2)
                   (while (> depth 0)
                          (set command (list.get code-list code-index))
                          (dec code-index)
                          (case command
                              ("]" (inc depth))
                              ("[" (dec depth)) ))
                   (inc code-index) )) ))

(print "Buffer: " (list.join buffer ""))
(print "Pointer:"  pointer)
(print "Steps:  "  steps)
(print ".....................")
(print "Input:  " (list.join input-list ""))
(print "Output: "  output)
`
    },

    {
        name: "Assembly Interpreter",
        code: `;; Assembly Interpreter

(let code-text "
 
;; FizBuz example
 
; Define messages
    fiz    EQU Fiz
    buz    EQU Buz
    fizbuz EQU FizBuz

; Define limits
    min    EQU 1
    max    EQU 100
 
    MOV CX min        ; Use CX register as a counter

loop :
    CMP CX max        ; Compare the current value with \`max\`
    JG exit           ; If \`current\` > \`max\`, jump to 'exit'

    MOV AX CX         ; Set \`current\` in AX to use it for MOD
    MOD 15            ; MOD set the reminder to AX and also sets the ZF
    JZ print-fizbuz   ; If ZF (Zero Flag) is set, we jump to 'print-fizbuz'
 
    MOV AX CX
    MOD 3
    JZ print-fiz
 
    MOV AX CX
    MOD 5
    JZ print-buz
 
    OUT CX            ; No Fiz / Buz, so we prtint the number

next-loop :
    INC CX            
    JMP loop          ; Loop

print-fiz :
    OUT fiz
    JMP next-loop

print-buz :
    OUT buz
    JMP next-loop
 
print-fizbuz :
    OUT fizbuz
    JMP next-loop

exit :
" )


(let AX 0) ; Accumulator Register
(let BX 0) ; Base Register
(let CX 0) ; Counter Register
(let DX 0) ; Data Register

(let ZF 0) ; Zero Flag
(let SF 0) ; Sign flag

(let IP 0) ; Instruction Pointer

(let var-names  (list)) ; Custom variables and labels names
(let var-values (list)) ; Custom variables and labels values

(function set-var (name val)
   (let index (list.index var-names name))
   (if (>= index 0)
       (list.set var-values index val)
       (block (list.add var-names  name)
              (list.add var-values val) )))

(function get-var (name)
   (let index (list.index var-names name))
   (if (>= index 0)
       (list.get var-values index)
       (throw (str.concat "Variable not defined: " name)) ))

(function set-val (name val)
    (case name
        ((EAX AH AL AX) (set AX val))
        ((EBX BH BL BX) (set BX val))
        ((ECX CH CL CX) (set CX val))
        ((EDX DH DL DX) (set DX val))
        (else (set-var name val)) ))

(function get-val (ref)
    (if (= (type-of ref) "number")
        ref
        (case ref
            ((EAX AH AL AX) AX)
            ((EBX BH BL BX) BX)
            ((ECX CH CL CX) CX)
            ((EDX DH DL DX) DX)
            (else (get-var ref)) )))

(function set-ZF (val)
    (set ZF (if (= val 0) 1 0)) )

(function set-SF (val)
    (set SF (if (< val 0) 1 0)) )

(function DD (name val)
    (set-var name val) )

(function EQU (name val)
    (set-var name val) )

(function MOV (p q)
    (let val (get-val q))
    (set-val p val) )

(function INC (p)
    (let res (+ (get-val p) 1))
    (set-val p res)
    (set-ZF res)
    (set-SF res) )

(function DEC (p)
    (let res (- (get-val p) 1))
    (set-val p res)
    (set-ZF res)
    (set-SF res) )

(function ADD (p q)
    (let res (+ (get-val p) (get-val q)))
    (set-val p res)
    (set-ZF res)
    (set-SF res) )

(function SUB (p q)
    (let res (- (get-val p) (get-val q)))
    (set-val p res)
    (set-ZF res)
    (set-SF res) )

(function MUL (p)
    (let res (* (get-val "AX") (get-val p)))
    (set-val "AX" res)
    (set-ZF res)
    (set-SF res) )

(function DIV (p)
    (let res (/ (get-val "AX") (get-val p)))
    (set-val "AX" res)
    (set-ZF res)
    (set-SF res) )

(function MOD (p)
    (let res (% (get-val "AX") (get-val p)))
    (set-val "AX" res)
    (set-ZF res)
    (set-SF res) )

(function AND (p q)
    (let res (and (get-val p) (get-val q)))
    (set-val p res)
    (set-ZF res) )

(function OR (p q)
    (let res (or (get-val p) (get-val q)))
    (set-val p res)
    (set-ZF res) )

(function TEST (p q)
    (let res (and (get-val p) (get-val q)))
    (set-ZF res) )

(function NOT (p)
    (let res (if (get-val p) 0 1))
    (set-val p res)
    (set-ZF res) )

(function CMP (p q)
    (let res (- (get-val p) (get-val q)))
    (set-ZF res)
    (set-SF res) )

(function jump (label)
    (set IP (get-val label)) )

(function JMP (label)
    (jump label) )

(function JE (label)
    (if ZF (jump label)) )

(function JNE (label)
    (unless ZF (jump label)) )

(function JL (label)
    (if (and (not ZF) SF)
        (jump label) ))

(function JLE (label)
    (if (or (and (not ZF) SF) ZF)
        (jump label) ))

(function JG (label)
    (if (and (not ZF) (not SF))
        (jump label) ))

(function JGE (label)
    (if (or (and (not ZF) (not SF)) ZF)
        (jump label) ))

(function JZ (label)
    (if ZF
        (jump label)) )

(function JNZ (label)
    (if (not ZF)
        (jump label)) )

(function OUT (ref)
    (print (get-val ref)) )

(function show-state ()
    (let i 0)
    (for var-name var-names
        (print var-name ":" (var-values i))
        (inc i) )

    (print "AX :" AX)
    (print "BX :" BX)
    (print "CX :" CX)
    (print "DX :" DX)
    (print "ZF :" ZF)
    (print "SF :" SF)
    (print "IP :" IP) )

(function eval-op (command p q)
    (case p
        ((DS DW DD DQ DT) (DD command q))
        ((EQU) (EQU command q))
        ((":") null)  ; Ignore labels
        (else (case command
                  ((EQU)   (EQU  p q))
                  ((MOV)   (MOV  p q))
                  ((INC)   (INC  p))
                  ((DEC)   (DEC  p))
                  ((ADD)   (ADD  p q))
                  ((SUB)   (SUB  p q))
                  ((MUL)   (MUL  p))
                  ((DIV)   (DIV  p))
                  ((MOD)   (MOD  p))
                  ((AND)   (AND  p q))
                  ((OR)    (OR   p q))
                  ((TEST)  (TEST p q))
                  ((NOT)   (NOT  p))
                  ((CMP)   (CMP  p q))
                  ((JMP)   (JMP  p))
                  ((JE)    (JE   p))
                  ((JNE)   (JNE  p))
                  ((JL)    (JL   p))
                  ((JLE)   (JLE  p))
                  ((JG)    (JG   p))
                  ((JGE)   (JGE  p))
                  ((JZ)    (JZ   p))
                  ((JNZ)   (JNZ  p))
                  ((OUT)   (OUT  p))
                  ((DEBUG) (show-state))
                  (else (throw (+ "Wrong command: " command " at IP: " IP)))   ))))

(function eval-label (label command)
    (if (= command ":")
        (set-var label IP) ))

(function parse-param (par-txt)
    (let num-param (to-number par-txt))
    (if (= (type-of num-param) "number")
        num-param
        par-txt ))

(function parse-code-line (code-line)
    ; Parse a command line
    (let split-parts (str.split code-line " "))
    (let non-empty-parts (list))
    (for element split-parts
        (unless (= element "")
                (list.add non-empty-parts element) ))

    (let command (list))
    (for par-txt non-empty-parts
        (let param (parse-param par-txt))
        (if (or (= (type-of param) "string")
                (= (type-of param) "number"))
            (list.add command param) ))

    command )

(function parse-code (code-txt)
    (let src-list (str.split code-txt "\\n"))
    (let command-list '())

    (for code-line src-list
        (let comment-index (str.index-of code-line ";"))
        (if (>= comment-index 0)
            (set code-line (str.sub-string code-line 0 comment-index)) )
        (set code-line (str.trim code-line))

        (if (> (str.length code-line) 0) (block
            (let command (parse-code-line code-line))
            (if (> (list.length command) 0)
                (list.add command-list command) ) )) )

    command-list )

(function eval-asm (code-txt)
    (let lst-commands     (parse-code code-txt))
    (let lst-commands-len (list.length lst-commands))

    (set IP 0)
    (for command lst-commands
        (call eval-label command)
        (inc IP) )

    (set IP 0)
    (let max-cycles 10000)
    (let cycle 0)
    (while (< IP lst-commands-len)
        (let command (list.get lst-commands IP))
        (call eval-op command)
        (inc IP)
        (inc cycle)
        (if (> cycle max-cycles)
            (throw "Too many cycles!") )) )

(eval-asm code-text)

`
    },
];

if (typeof module === "object") {
    module.exports.codeExamples = examplesList;
}
