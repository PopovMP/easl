# EASL

Try EASL online: https://easl.forexsb.com/

## Why EASL?

EASL is designed to be small scripting language for integration in online applications.

Features:
  - minimal impact on the hosting app.
  - safe. EASL works on own memory environment. It executes only predefined commands.
  - pure. EASL embraces the functional programming paradigm. No side effects.
  - immutable. All variables are immutable by default.
  - powerful. It supports higher order functions, recursion, closure.
  

## Use on  server

    npm install
    npm run build
    npm run test

Execute code:

    const Easl = require("../bin/easl.js").Easl;
    const easl = new Easl();
      
    const code = '  {let lst [1 2 3 4]}
                    (list.length lst)    `;
                    
    const res = eas.evaluate(code);
    
    console.log(res);


## Use in browser

    <script src="js/easl.js"></script>
    <script>
        const easl = new Easl();

        const code = '  {let lst [1 2 3 4]}
                        (list.length lst)   `;
                        
        const res = eas.evaluate(code);
        console.log(res);
    </script>


## Grammar


EASL is inspired by the *scheme* language and covers almost all teh scheme base features. 


### Null

Null can be represented with the keyword `null`.


### Boolean constant

Faulty values are:

     false - reserved keyword,
     null  - reserved keyword,
     []    - an empty list,
     ""    - an empty string,
     0     - zero
  
  
Truthy values are:

     true     - reserved keyword,
     [1 2 3]  - a non empty list,
     "hello"  - a non empty string,
     42       - a number. As well as a rela number like 3.14


### Value types

    boolean  - true, false
    number   - 0, 42, 3.14
    string   - "Hello World!"
    null     - the "null" keyword
    function - a function
    list     - a list of values in square brackets: [1 2 3] , ["white", "red", "green"]

We can check the type with the predicates:

`boolean?`  - examples:  `(boolean? true) → true`, `(boolean? false) → true`, `(boolean? 42) → false`

`number?` - examples: `(number? 0) → true`, `(number? 3.14) → true`, `(number? 1-000-000) → true`

`string?` - examples: `(string? "") → true`, `(string? "hello") → true`, `(string? 42) → false`

`null?` - examples: `(null? null) → true`, `(null? []) → false`, `(null? 0) → false`

`function?` - !!! To be done

`list?` - examples: `(list? []) → true`, `(list? [1 (+ 2 3)]) → true`

`pair?` - examples: `(pair? [1 2]) → true`, `(pair? 1) → false`
  
## Reserved keywords

    Constants:     true, false, null
    Types:         number, string, list, function, 
    Definition:    let, function, lambda
    Condition:     if, else, switch, case
    Cycle:         for, break, continue, do, while, default
    Builtin proc:  typeof
 

## Variable definition

EASL defines variables with the keyword `let`.

There are three possible syntax:

#### Definition and initialization of a variable with a constant value
 
    {let n 5}
    {let is-member true}
    {let lst [1 2 3 4]}
    {let first-name "John"}
    
### Initialization from an expression

    {let pi  (/ 22 7)}
    {let hello (str.append "Hello "  "world!")}


## Functions

## Named function

Definition: `{function func-id (par1 par2 ...) (expression) }`

A function returns the value of the last expression.

We call functions with: `(func-id par1 par2)`

    {function sum (a b) (+ a b)}
    (sum 2 3) ;; → 5

### Lambda

A lambda is a nameless function: `{lambda (par1 par2 ...) (expression)}`

Yuo can assign a lambda to a variable:

    {let sum {lambda (a b) (+ a b)}}
    (sum 2 3) ;; → 5

You can call a `lambda` directly by enclosing it in parenthesis:

    ({lambda (a b) (+ a b)} 2 3)  ;; → 5
    
You can use a `lambda` as a function argument:

    {function calc (operation a b)
        (operation a b)}

    (calc {lambda (a b) (+ a b)} 2 3)   ;; → 5

A function can return a `lambda`:

    {function make-identity ()
        {lambda (a) (a)}}

    (let identity (make-identity))

    (identity 5) ;; → 5 
    
## if

    {if (clause) (then-expression) (else-expression) }

## cond

    {cond
       [(clause)  (expression)]
       [(clause)  (expression)]
       [else (expression)]}      

## for

    {for (i 0) (< i 10) (+ i 1) expr1 expr2 ...}

## Lists

EASL defines lists in square brackets. Examples: `[1 2 3]` - a list of numbers, `[ "I" "am" "a" "list" "of" "strings"]`. A list can contain values from different types.

List functions:

`list.empty` - gets an empty list: `(list.empty) → []`

`list.empty?` - checks if a list is empty: `(list.empty? [1 2 3]) → false`, `(list.empty? []) → true`

`list.length` - gives the length of a list: `(list.length [1 2 3])  → 3`

`list.first` - gets the first element: `(list.first [1 2 3]) → 1`, `(list.first []) → null`

`list.rest` - gets all elements without the first one: `(list.rest [1 2 3]) → [2 3]`, `(list.rest []) → []`

`list.last` - gets the last element: `(list.last [1 2 3]) → 3`, `(list.last []) → []`

`list.least` - gets all elements without the last one: `(list.least [1 2 3]) → [1 2]`, `(list.least []) → []`

`list.add` - adds an element to the end: `(list.add 4 [1 2 3]) → [1 2 3 4]`, `(list.add 1 []) → [1]`
 
`list.push` - pushes an element to the beginning of the list: `(list.push 0 [1 2 3]) → [0 1 2 3]`, `(list.push 1 []) → [1]`
 
`list.has` - checks if a list contains an element: `(list.has 3 [1 2 3]) → true`, `(list.has 1 []) → false`
 
`list.index` - gets the index of an element or -1: `(list.index 3 [1 2 3]) → 2`, `(list.has 1 [3 4 5]) → -1`

`list.get` - gets an element at an index: `(list.get 1 [1 2 3]) → 2`. The index is within the range of the list.

`list.set` - sets an element at an index: `(list.set 4 0 [1 2 3]) → [4 2 3]`. The index is within the range of the list.
`list.set` does not modify the list. It returns a new list instead.

`list.swap` - swaps two elements of a list: `(list.swap 0 1 [1 2 3]) → [ 2, 1, 3 ]`

`list.append` - appends lists: `(list.append [1 2 3] [4 5 6]) → [1 2 3 4 5 6]`.

`list.slice` - gets a subset of a list from index to index (not inclusive): `(list.slice 1 3 [1 2 3 4 5 6]) → [2 3]`.

`list.flatten` - flattens a nested lists: `(list.append [1 2 [3 4] 5 6]) → [1 2 3 4 5 6]`.

`list.join` - joins the list elements into a string: `(list.join ", " [1 2 3]) → "1, 2, 3"`.

## Strings

A string is closed within quotation marks: `"Hello World!"`

`str.lenght` - gets the number of characters: `(str.length "hello") → 5`

`str.concat` - concatenates two strings:  `(str.concat "Hello " "world!") → "Hello world!"`

`str.sub-string`

`str.to-lower`

`str.to-upper`

`str.has` - returns `true` if the string contains substring. `(str.has "lo" "hello") → true`

`str.starts-with`

`str.ends-with`

`str.to-char-list`

## Numbers

`numb.parse` - converts string to number. Returns `null` if the string cannot be converted


## Math

`math.abs`

`math.ceil`

`math.exp`

`math.floor`

`math.log`

`math.min`

`math.max`

`math.pow`

`math.random`

`math.round`

`math.sqrt`

