"use strict";

const examplesList = [
    {
        name: "Print numbers from 1 to 5",
        code: `;; Print numbers from 1 to 5

(let n 1)       ; initialize a counter
(while (< n 6)  ; evaluate the condition
    (print n)   ; the 'while' loop body
    (inc   n))  ; increment the counter
`
    },

    {
        name: "Working with lists",
        code: `;; We define a list in square brackets.
(print "Range of size 8 starting from 1 :" (list-range 8 1))
(print "List with size 8 filled with 1  :" (list-make 8 1))
(print "Declare and define a new list   :" '(list 0 1 2 3))
(const lst (list 0 1 2 3))
(print "A list of numbers               :" lst)
(print "The list length                 :" (list-length  lst    ))
(print "The first element               :" (list-get     lst 0  ))
(print "All but first one               :" (list-slice   lst 1  ))
(print "The last element                :" (list-get     lst   (- (list-length lst) 1)) )
(print "All but the last one            :" (list-slice   lst 0 (- (list-length lst) 1)) )
(print "The third element               :" (list-get     lst 2  ))
(print "From the 2nd to the 4th         :" (list-slice   lst 1 4))
(print "Add an element to the end       :" (list-push    lst 4  )) ; Returns the new length of the list
(print "Set 1st element on place        :" (list-set     lst 0 2)) ; Returns the new element
(print "Push one elem in front          :" (list-unshift lst 3  )) ; Returns the new length of the list
(print "Sort a list on place and get it :" (list-sort    lst    ))

`
    },

    {
        name: "Print random integers",
        code: `;; Print 10 random integers
(import "https://easl.forexsb.com/easl/list-hof.easl")

;; Imperative style
(const lst (list))

(repeat 10
    (list-push lst (math-round (* 100 (math-random)))))

(print lst)


;; Functional style
(print (list-map (list-make 10)
                 (λ (element index)
                    (math-round << * 100 << math-random))))


;; The best of two worlds
(print (collect
          (repeat 10
             (yield (math-round << * 100 << math-random)))))
`
    },

    {
        name: "Odd or even with 'case'",
        code: `;; Odd or even with 'case'

; Generate a random number between 0 and 9
(const n (math-floor (* 10 (math-random))) )

; Checks which list of options contains the value of 'n' and returns the text.
(const type (case n
               ((0 2 4 6 8) "even")
               ((1 3 5 7 9) "odd" ) ))

(print n "is" type)
`
    },

    {
        name: "First class citizens",
        code: `;; Functions are first class citizens

(const a    9)
(const b    3)
(const plus +)

(const op (if (> a b) plus -))
(print (op a b))

;; Loop over functions in a list. Apply each function on two arguments.
(for fun '(+ - * / % < > <= >= = != ~ list list-range list-make math-max math-pow)
    (print \`(,fun ,a ,b) '=> (fun a b)))
`
    },

    {
        name: "Function with optional arguments",
        code: `;; The function's arguments are optional.
(const sum ((a 0) (b 0))
   (+ a b))

(print "(sum)     →" (sum))
(print "(sum 1)   →" (sum 1))
(print "(sum 1 2) →" (sum 1 2))
`
    },

    {
        name: "Implementation of 'map'",
        code: `;; Implementation of 'map' in EASL

(const map (lst func)
    (collect
        (const len (list-length lst))
        (let i 0)    

        (while (< i len)
             (yield (func (list-get lst i)))
             (inc i))))

(const range (list-range 10 1))         ; Make a range form 1 to 10
(const lst (map range (λ (e) (* e 2)))) ; Double each element 
(print lst)
`
    },

    {
        name: "Implementation of 'for-each'",
        code: `;; Implementation of 'for-each' in EASL

(const for-each (lst func)
    (const len (list-length lst))

    (let i 0)
    (while (< i len)
         (func << list-get lst i)
         (inc i)))

(const printer (λ (e)
                  (display e)
                  (display " ")))

(for-each (list-range 10 1) printer)
`
    },

    {
    name: "Swap list elements",
    code:
    `;; Swap list elements

(const swap-on-place (lst i1 i2)
    (const temp (list-get lst i1))
    (list-set lst i1 << list-get lst i2)
    (list-set lst i2 temp))

(const lst '(1 2 3 4))
(print "Original:" lst)
(swap-on-place lst 0 3)
(print "Swapped :" lst)
`
    },

    {
        name: "Factorial",
        code: `;; Factorial

(const fac (n)
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

(print
    (collect
        (for i (list-range 100 1)
            (yield (or (~ (if (% i 3) "" "Fizz")
                          (if (% i 5) "" "Buzz"))
                       i)))))
`
    },

    {
        name: "FizzBuzz recursive style",
        code: `;; FizzBuzz recursive style

(const is-dev-by (n m)
    (= (% n m) 0))

(const get-fizz-buzz (n)
    (cond
        ((is-dev-by n 15) "FizzBuzz")
        ((is-dev-by n  3) "Fizz")
        ((is-dev-by n  5) "Buzz")
        (else n)))

(const fizz-buzz (max)
    (collect
        (const loop (n)
            (when (<= n max)
                (yield (get-fizz-buzz n))
                (loop (+ n 1))))
        (loop 1)))

(print (fizz-buzz 100))
`    },

    {
        name: "Fibonacci - tail optimized",
        code: `;; Fibonacci - tail optimized

(const fibo (n)
    (const loop (i prev cur)
        (if (= i n)
            cur
            (loop (+ i 1)
                  cur
                  (+ prev cur))))
    (case n
        ((1 2) 1)
        (else (loop 2 1 1))))

;; Print
(for i (list-range 9 1)
    (print \`(fibo , i) '=> (fibo i)))
`   },

    {
        name: "Benchmark: for, apply, recursion",
        code: `;; Benchmark: for, apply, recursion
;; Calculate the sum of a list by using three different methods

;; Call "+" on each elements of the list
(const sum-list-apply (lst)
    (apply + lst) )

;; Use "for" loop over the given list
(const sum-list-for (lst)
    (let sum 0)
    (for n lst
        (inc sum n))
    sum )

;; Tail optimised recursion
(const sum-list-rec (lst)
    (const loop (index acc)
        (if index
            (loop (- index 1)
                  (+ acc (list-get lst index)))
            (+ acc (list-get lst 0))))
    (loop (- (list-length lst) 1) 0))

;; Benchmark function
(const benchmark (func lst times method)
    (const start-time (date-now))

    (for _ (list-make times)
        (func lst))
 
    (const time (/ (- (date-now) start-time) 1000))
    (const res  (func lst))
    (print "Using:" method "Res:" res "Time:" time) )

;; Make a list from 1 to N inclusively
(const lst-nums (list-range 100 1)) ;; Try with 10, 100, or 1000 elements

(const rounds 1000)

(benchmark sum-list-apply lst-nums rounds "apply")
(benchmark sum-list-for   lst-nums rounds "for  ")
(benchmark sum-list-rec   lst-nums rounds "rec  ")
`
    },

    {
        name: "Find the maximum of a list",
        code: `;; Find the maximum of a list recursively


(const list-max (lst)
    (const len (list-length lst))

    (const loop (index max)
        (if (= index len)
            max
            (loop (+ index 1)
                  (math-max max
                            (list-get lst index)))))

    (loop 0 (list-get lst 0)))

(const lst '(42 34 12 5 62 2))
(print "List :" lst)
(print "Max  :" (list-max lst))
`
    },

    {
        name: "Eliminate consecutive duplicates",
        code: `;; Eliminate consecutive duplicates

(const clear (lst)
    (collect
        (let last null)
        (for e lst
            (unless (equal last e)
                (set last e)
                (yield e)))))

(print (clear '(0 1 1 2 3 4 5 5 5 6 7 7 8 8 8 9 9 9)))
`
    },

    {
        name: "Higher order functions",
        code: `;; Higher order functions for Lists

; The source code of the list HOF is at the link below
(import "https://easl.forexsb.com/easl/list-hof.easl")

(const lst '(1 2 3 4 5))

; (list-reduce lst (λ (element accumulator index) (...)) initial-value) 
(const sum (list-reduce lst (λ (e acc) (+ e acc))  0) )
(print "sum elem" sum)


; (list-map lst (λ (element index) (...)))
(const doubled (list-map lst (λ (e) (* 2 e))))

(print "doubled" doubled)

; (list-for-each lst (λ (element index) (...)))
(list-for-each lst (λ (e i) (print (string-repeat " " (- (list-length lst) i)) e)))


; (list-filter lst (λ (element index) (...)))
(const odd (list-filter lst (λ (e) (and (% e 2) e))))

(print "odd elem" odd)


; (list-any lst (λ (element index) (...)))
(const has-gt-3 (list-any lst (λ (e) (> e 3))))

(print "has elem > 3" has-gt-3)


; (list-all lst (λ (element index) (...)))
(const all-gt-3 (list-all lst (λ (e) (> e 3))))

(print "all elem > 3" all-gt-3)
 
`
    },

    {
        name: "Hanoi tower",
        code: `;; Hanoi tower

(const move (from to)
    (print "Move disk from" from "to" to) )

(const solve (n from to through)
    (when (> n 0)
          (solve (- n 1) from through to)
          (move from to)
          (solve (- n 1) through to from) ))

(solve 4 "A" "C" "B")

`
    },

    {
        name: "Mutual recursive default parameters",
        code: `;; Mutual recursive default parameters

(const odd-even (n
               (is-even (λ (n)
                   (or (= n 0)
                       (is-odd (- n 1)))))
               (is-odd (λ (n)
                   (and (!= n 0)
                        (is-even (- n 1))))))
    (if (is-even n)
        'even
        'odd))

(for n (list-range 10)
    (print n 'is (odd-even n)))
`
    },

    {
        name: "Closure adder",
        code: `;; Closure adder

(const add ((m 0))
    (λ ((n null))
       (if (equal n null)
           m
           (add (+ n m)))))

(print '((add))           "=>" ((add))           )
(print '((add 3))         "=>" ((add 3))         )
(print '(((add 3) 4))     "=>" (((add 3) 4))     )
(print '((((add 3) 4) 5)) "=>" ((((add 3) 4) 5)) )
`
    },

    {
        name: "Closure counter",
        code: `;; Closure counter

(const make-counter ((initial-value 0) (delta 1))
    (let value (- initial-value delta))
    (λ () (inc value delta)) )

(const count (make-counter))
(print (count) (count) (count) (count))

(const count10  (make-counter 0 10))
(print (count10) (count10) (count10) (count10))

(const counter (make-counter 4 -1))
(while (counter) (print "***"))
`   },

    {
        name: "Sequence generator",
        code: `;; Sequence generator

(const make-sequence (size first next)
    (collect
        (yield first)
        (const loop (index prev)
            (when (< index size)
                (const new (next prev))
                (yield new)
                (loop (+ index 1) new)))
        (loop 1 first)))

(print "Sequence:"
       (make-sequence 10 3 (λ (e) (* 3 e))))
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
(const src "
    (const lst '(1 2 3 4 5 6 7))
    (const len (list-length lst))
    (* 6 len)
" )

(const ilc (parse src)) ; Parse the source code to intermediate language
(const res (eval  ilc)) ; Eval the intermediate language

(print "The answer is:" res)
`
    },

    {
        name: "OOP - List based",
        code: `;; OOP - List based

(enum .fname .lname .age)

(const person.new (fname lname age)
     (list fname lname age) )

(const person.clone (person)
    (list-slice person) )

(const person.grow (person)
    (list-set person .age (+ (list-get person .age) 1)))

(const person.say (person)
    (print (list-join person " ")))

(const john (person.new "John" "Doe" 33))
(person.say  john)
(person.grow john)
(person.say  john)
`
    },

    {
        name: "OOP - Message based",
        code: `;; Demonstration of a message based OOP implemented with closure.

;; Person's attributes
(enum .first-name .last-name .clone)

;; Person factory
(const make-person (first-name last-name)
    (lambda ((action -1) (value ""))
        (cond
            ((= action .first-name) 
                  (if value
                      (make-person value  last-name)
                      first-name))
            ((= action .last-name)
                  (if value
                      (make-person first-name value)
                      last-name ))
            ((= action .clone)
                  (make-person first-name last-name))
            (else (~ "I am " first-name " " last-name "!")))))

;; Create a person: John Smith
(const john-smith (make-person "John" "Smith"))

;; Get properties
(print (john-smith))
(print "My first name is:" (john-smith .first-name))
(print "My last  name is:" (john-smith .last-name ))

;; When set a property, the factory returns a new object
(const john-doe (john-smith .last-name "Doe"))
(print (john-doe))

;; clone an object
(const john-doe-clone (john-doe .clone))

;; Change the first name of the clone
(const jane-doe (john-doe-clone .first-name "Jane"))
(print (jane-doe))
`   },

    {
        name: "OOP - Lambda Calculus style",
        code: `;; OOP - Lambda Calculus style

(const Person (name initial-age)
   (let age initial-age)
   (const grow (λ ()
                  (inc age)))
   (λ (f)
      (f name age grow)))

(const name (name age grow) name)
(const age  (name age grow) age)
(const grow (name age grow) (grow))
(const who  (name age grow) (print name age))

(const john (Person "John" 33))
(john grow)

(const Singer (person)
    (const sing (λ (song)
                   (print "🎵" song)))
    (λ (f)
       (f person sing)))

(const person (person sing) person)
(const sing   (person sing) sing)

(const johnSinger (Singer john))
((johnSinger person) who)
((johnSinger sing) "Tra la la")
`
    },

    {
        name: "Unit testing with 'assert-lib'",
        code: `;; Unit tests

(import "https://easl.forexsb.com/easl/assert.easl")

(assert.equal (+ 2 3) 5 "Sum two numbers")

(assert.true '(1 2 3) "A non empty list is true.")

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
	(const sum (a b) (+ a b))
    (assert.equal (sum 2 3) 5 "Call a function with two args.") ))

(assert.equal 13 42 "The answer to Life, the Universe, and Everything!")
`
    },

    {
        name: "Lambda Calculus",
        code: `;; Lambda Calculus

;; Lambda Calculus

;; Boolean logic

(const TRUE  (λ (x) (λ (y) x)))
(const FALSE (λ (x) (λ (y) y)))
(const NOT   (λ (p) ((p FALSE) TRUE) ))
(const AND   (λ (p) (λ (q) ((p q) p) )))
(const OR    (λ (p) (λ (q) ((p p) q) )))
(const IF    (λ (p) (λ (x) (λ (y) ((p x) y) )))) 

;; Alonso Church numbers representation

(const zero  (λ (f) (λ (x) x )))
(const one   (λ (f) (λ (x) (f x) )))
(const two   (λ (f) (λ (x) (f (f x)) )))
(const three (λ (f) (λ (x) (f (f (f x))) )))
(const four  (λ (f) (λ (x) (f (f (f (f x)))) )))
(const five  (λ (f) (λ (x) (f (f (f (f (f x))))) )))
(const six   (λ (f) (λ (x) (f (f (f (f (f (f x)))))) )))
(const seven (λ (f) (λ (x) (f (f (f (f (f (f (f x))))))) )))
(const eight (λ (f) (λ (x) (f (f (f (f (f (f (f (f x)))))))) )))
(const nine  (λ (f) (λ (x) (f (f (f (f (f (f (f (f (f x))))))))) )))
(const ten   (λ (f) (λ (x) (f (f (f (f (f (f (f (f (f (f x)))))))))) )))

;; Algebra 

(const succ     (λ (n) (λ (f) (λ (x) (f ((n f) x)) ))))
(const pred     (λ (n) (λ (f) (λ (x) (((n (λ (g) (λ (h) (h (g f))))) (λ (u) x)) (λ (u) u)) ))))

(const add      (λ (m) (λ (n) ((m succ) n) )))
(const sub      (λ (m) (λ (n) ((n pred) m) )))

(const mult     (λ (m) (λ (n) (λ (f) (m (n f)) ))))
(const power    (λ (m) (λ (n) (n m) )))

(const zero?    (λ (n) ((n (λ (x) FALSE)) TRUE) ))
(const lte?     (λ (m) (λ (n) (zero? ((sub m) n)) )))

;; Converts a Church number to an integer
(const int  (λ (cn) ((cn (λ (n) (+ n 1))) 0)))

;; Converts a Church boolean to bool
(const bool (λ (cb) ((cb true) false) ))

;; Examples
(print "one =" (int one))
(const forty-two ((add ((mult ten) four)) two))
(print "forty-one   =" (int (pred forty-two)))
(print "forty-two   =" (int forty-two))
(print "forty-three =" (int (succ forty-two)))
(print "zero? 0"  (bool (zero? zero)))
(print "zero? 1"  (bool (zero?  one)))
(print "lte? 3 4" (bool ((lte? three)  four)))
(print "lte? 4 3" (bool ((lte?  four) three)))

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
(const fac (λ (n) ((((IF ((lte? n) one))
                     (λ () one))
                     (λ () ((mult n) (fac (pred n))))))))

(print "factorial 5 =" (int (fac five)))

;; Fibonacci
(const fib (λ (n) ((((IF ((lte? n) one))
                     (λ () one))
                     (λ () ((add (fib ((sub n) one)))
                                 (fib ((sub n) two))))))))

(print "Fibonacci 9 =" (int (fib nine)))

`
    },

    {
        name: "BrainFuck Interpreter",
        code: `;; BrainFuck Interpreter

(const code-text  "

   Adds two digits from the input
   ,>++++++[<-------->-],[<+>-]<.
 
")

(const input-text "34")

(const code-list '())
(for ch (string-split code-text)
   (when (list-has (list "+" "-" ">" "<" "," "." "[" "]") ch)
       (list-push code-list ch)))

(let code-index  0)
(const code-len (list-length code-list))

(let input-index 0)
(const input-list (string-split input-text))

(const buffer '(0))
(let pointer  0)
(let command "")
(let output  "")
(let steps    0)

(while (< code-index code-len)
    ;; Read the current command.
    (set command (list-get code-list code-index))
    (inc code-index)
    (inc steps)
 
    (case command
        ;; Increment the pointer.
        ((">") (inc pointer)
             (when (= (list-length buffer) pointer)
                 (list-push buffer 0) ))

        ;; Decrement the pointer.
        (("<") (if (> pointer 0)
                   (dec pointer)
                   (print "Error: pointer < 0")))

        ;; Increment the byte at the pointer.
        (("+") (list-set buffer pointer
                     (+ (list-get buffer pointer) 1) ))

        ;; Decrement the byte at the pointer.
        (("-") (list-set buffer pointer
                     (- (list-get buffer pointer) 1) ))

        ;; Output the byte at the pointer.
        ((".") (set output (~ output
                            (string-from-char-code (list-get buffer pointer))) ))

        ;; Input a byte and store it in the byte at the pointer.
        ((",") (const input (list-get input-list input-index))
             (inc input-index)
             (list-set buffer pointer
                     (if (equal (type-of input) "string")
                         (string-char-code-at input 0)
                         0 )))

        ;; Jump forward past the matching ] if the byte at the pointer is zero.
        ("[" (when (= (list-get buffer pointer) 0)
                   (let depth 1)
                   (while (> depth 0)
                          (set command (list-get code-list code-index))
                          (inc code-index)
                          (case command
                              ("[" (inc depth))
                              ("]" (dec depth)) ))))

        ;; Jump backward to the matching [ unless the byte at the pointer is zero.
        ("]" (when (not (= (list-get buffer pointer) 0))
                   (let depth 1)
                   (dec code-index 2)
                   (while (> depth 0)
                          (set command (list-get code-list code-index))
                          (dec code-index)
                          (case command
                              ("]" (inc depth))
                              ("[" (dec depth)) ))
                   (inc code-index) )) ))

(print "Buffer: " (list-join buffer ""))
(print "Pointer:"  pointer)
(print "Steps:  "  steps)
(print ".....................")
(print "Input:  " (list-join input-list ""))
(print "Output: "  output)
`
    },

    {
        name: "Assembly Interpreter",
        code: `;; Assembly Interpreter

(const code-text "
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

(const var-names  (list)) ; Custom variables and labels names
(const var-values (list)) ; Custom variables and labels values

(const set-var (name val)
   (const index (list-index-of var-names name))
   (cond
       ((>= index 0) (list-set var-values index val))
       (else (list-push var-names  name)
             (list-push var-values val))))

(const get-var (name)
   (const index (list-index-of var-names name))
   (if (>= index 0)
       (list-get var-values index)
       (throw (string-concat "Variable not defined: " name)) ))

(const set-val (name val)
    (case name
        ((EAX AH AL AX) (set AX val))
        ((EBX BH BL BX) (set BX val))
        ((ECX CH CL CX) (set CX val))
        ((EDX DH DL DX) (set DX val))
        (else (set-var name val)) ))

(const get-val (ref)
    (if (equal (type-of ref) "number")
        ref
        (case ref
            ((EAX AH AL AX) AX)
            ((EBX BH BL BX) BX)
            ((ECX CH CL CX) CX)
            ((EDX DH DL DX) DX)
            (else (get-var ref)) )))

(const set-ZF (val)
    (set ZF (if (= val 0) 1 0)) )

(const set-SF (val)
    (set SF (if (< val 0) 1 0)) )

(const DD (name val)
    (set-var name val) )

(const EQU (name val)
    (set-var name val) )

(const MOV (p q)
    (const val (get-val q))
    (set-val p val) )

(const INC (p)
    (const res (+ (get-val p) 1))
    (set-val p res)
    (set-ZF res)
    (set-SF res) )

(const DEC (p)
    (const res (- (get-val p) 1))
    (set-val p res)
    (set-ZF res)
    (set-SF res) )

(const ADD (p q)
    (const res (+ (get-val p) (get-val q)))
    (set-val p res)
    (set-ZF res)
    (set-SF res) )

(const SUB (p q)
    (const res (- (get-val p) (get-val q)))
    (set-val p res)
    (set-ZF res)
    (set-SF res) )

(const MUL (p)
    (const res (* (get-val "AX") (get-val p)))
    (set-val "AX" res)
    (set-ZF res)
    (set-SF res) )

(const DIV (p)
    (const res (/ (get-val "AX") (get-val p)))
    (set-val "AX" res)
    (set-ZF res)
    (set-SF res) )

(const MOD (p)
    (const res (% (get-val "AX") (get-val p)))
    (set-val "AX" res)
    (set-ZF res)
    (set-SF res) )

(const AND (p q)
    (const res (and (get-val p) (get-val q)))
    (set-val p res)
    (set-ZF res) )

(const OR (p q)
    (const res (or (get-val p) (get-val q)))
    (set-val p res)
    (set-ZF res) )

(const TEST (p q)
    (const res (and (get-val p) (get-val q)))
    (set-ZF res) )

(const NOT (p)
    (const res (if (get-val p) 0 1))
    (set-val p res)
    (set-ZF res) )

(const CMP (p q)
    (const res (- (get-val p) (get-val q)))
    (set-ZF res)
    (set-SF res) )

(const jump (label)
    (set IP (get-val label)) )

(const JMP (label)
    (jump label) )

(const JE (label)
    (when ZF (jump label)) )

(const JNE (label)
    (unless ZF (jump label)) )

(const JL (label)
    (when (and (not ZF) SF)
        (jump label) ))

(const JLE (label)
    (when (or (and (not ZF) SF) ZF)
        (jump label) ))

(const JG (label)
    (when (and (not ZF) (not SF))
        (jump label) ))

(const JGE (label)
    (when (or (and (not ZF) (not SF)) ZF)
        (jump label) ))

(const JZ (label)
    (when ZF
        (jump label)) )

(const JNZ (label)
    (when (not ZF)
        (jump label)) )

(const OUT (ref)
    (print (get-val ref)) )

(const show-state ()
    (const i 0)
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

(const eval-op (command p (q null))
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
                  (else (throw (~ "Wrong command: " command " at IP: " IP)))   ))))

(const eval-label (label command)
    (when (equal command ":")
        (set-var label IP)))

(const parse-param (par-txt)
    (const num-param (to-number par-txt))
    (if (equal (type-of num-param) "number")
        num-param
        par-txt))

(const parse-code-line (code-line)
    ; Parse a command line
    (const split-parts (string-split code-line " "))
    (const non-empty-parts (list))
    (for element split-parts
        (unless (equal element "")
            (list-push non-empty-parts element)))

    (const command (list))
    (for par-txt non-empty-parts
        (const param (parse-param par-txt))
        (when (or (equal (type-of param) "string")
                  (equal (type-of param) "number"))
            (list-push command param)))

    command)

(const trim-comment (code-line)
    (const comment-index (string-index-of code-line ";"))
    (if (>= comment-index 0)
        (string-sub-string code-line 0 comment-index)
        code-line))

(const parse-code (code-txt)
    (const command-list (list))

    (for code-line-raw (string-split code-txt "\\n")
        (const code-line (string-trim (trim-comment code-line-raw)))

        (when (> (string-length code-line) 0)
            (const command (parse-code-line code-line))
            (when (> (list-length command) 0)
                (list-push command-list command))))

    command-list)

(const eval-asm (code-txt)
    (const commands (parse-code code-txt))
    (const commands-length (list-length commands))

    (set IP 0)
    (for command commands
        (apply eval-label command)
        (inc IP) )

    (set IP 0)
    (const max-cycles 10000)
    (let cycle 0)
    (while (< IP commands-length)
        (apply eval-op (list-get commands IP))
        (inc IP)
        (inc cycle)
        (when (> cycle max-cycles)
            (throw "Too many cycles!"))))

(eval-asm code-text)
`
    },


    {
        name: "EASL to JavaScript",
        code: `;; EASL to JavaScript

(import "https://easl.forexsb.com/easl/alist.easl")
(import "https://easl.forexsb.com/easl/easl-to-js-parser.easl")
(import "https://easl.forexsb.com/easl/easl-to-js-forms.easl")
(import "https://easl.forexsb.com/easl/easl-to-js-core-lib.easl")
(import "https://easl.forexsb.com/easl/easl-to-js-number-lib.easl")
(import "https://easl.forexsb.com/easl/easl-to-js-math-lib.easl")
(import "https://easl.forexsb.com/easl/easl-to-js-list-lib.easl")
(import "https://easl.forexsb.com/easl/easl-to-js-string-lib.easl")
(import "https://easl.forexsb.com/easl/easl-to-js-date-lib.easl")

(print (parse-code '( 

(print (collect
           (for i (list-range 100 1)
               (yield (or (~ (if (% i 3) "" "Fizz")
                             (if (% i 5) "" "Buzz"))
                          i)))))

)))

`   },

];

if (typeof module === "object") {
    module.exports.codeExamples = examplesList;
}
