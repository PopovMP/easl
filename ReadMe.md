# EASL

## Grammar


### Null

Null can be represented with the keyword `null` or with an empty list `[]`

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

    boolean?
    number?
    string?
    null?
    function?
    list?
    pair?
  
Also we can sue the function `get-type`. Example: `(get-type [1 2 3]) → "list"`


## Reserved keywords

`and`    - logical `and`. Example: `(and true false) → false`   

`begin`  - defines a block of several expressions. The block return the value of the last expression.
Example `{begin (+ 2 4) (+ 1 2)} → 3`. We use curly braces for the code blocks.   

`boolean` - denotes teh `boolean` a data type. `(get-type true) → boolean`   

`case` - used with `switch`  

`cond` - 
`define` -    
`do` -    
`double` -    
`else` -    
`false` -    
`for` -    
`function` -    
`if` -    
`int` -    
`lambda` -    
`let` -    
`let*` -    
`letrec` -    
`list` -    
`not` -    
`null` -    
`number` -    
`or` -    
`quote` -    
`set!` -    
`string` -    
`switch` -    
`symbol` -    
`true` -    
`while` -    


 

### Variable definition

EASL defines variables with the keyword `let`.

There are three possible syntax:

##### Definition and initialization of a variable with a constant value
 
    {let n 5}
    {let is-member true}
    {let lst [1 2 3 4]}
    {let indicator-name "Moving Avergae"}
    
#### Initialization from an expression

    {let one-day-ms  (* 1000 60 60 24)}
    {let full-name (str.append "John" " " "Smith")}
    {let ma (fx.moving-average (eas.get-data "EURUSD H1"))}
    
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

`list.length` - gives the length of an list: `(list.length [1 2 3])  → 3`

`list.first` - gets the first element: `(list.first [1 2 3]) → 1`, `(list.first []) → null`

`list.rest` - gets the all elements without the first one: `(list.rest [1 2 3]) → [2 3]`, `(list.rest []) → []`

`list.last` - gets the last element: `(list.first [1 2 3]) → 3`, `(list.first []) → []`

`list.least` - gets the all elements without the last one: `(list.least [1 2 3]) → [1 2]`, `(list.least []) → []`

`list.add` - adds an element to the end: `(list.add 4 [1 2 3]) → [1 2 3 4]`, `(list.add 1 []) → [1]`
 
`list.push` - adds an element at the beginning: `(list.push 0 [1 2 3]) → [0 1 2 3]`, `(list.push 1 []) → [1]`
 
`list.has` - check if a list contains an element: `(list.has 3 [1 2 3]) → true`, `(list.has 1 []) → false`
 
`list.index` - gets the index of an element or -1: `(list.index 3 [1 2 3]) → 2`, `(list.has 1 [3 4 5]) → -1`

`list.get` - gets an element at an index: `(list.get 1 [1 2 3]) → 2`. The index is within the range of the list.

`list.set` - sets an element at an index: `(list.set 4 0 [1 2 3]) → [4 2 3]`. The index is within the range of the list.

`list.swap` - swaps two elements of a list: `(list.swap 0 1 [1 2 3]) → [ 2, 1, 3 ]`

`list.append` - appends lists: `(list.append [1 2 3] [4 5 6]) → [1 2 3 4 5 6]`.

`list.slice` - gets a subset of a list from index to index (not inclusive): `(list.slice 1 3 [1 2 3 4 5 6]) → [2 3]`.

`list.flatten` - flattens a nested lists: `(list.append [1 2 [3 4] 5 6]) → [1 2 3 4 5 6]`.

`list.join` - joins the list elements into a string: `(list.join ", " [1 2 3]) → "1, 2, 3"`.

## Strings

A string is closed within quotation marks: `"Hello World!"`

`str.lenght`

`str.append`

`str.sub-string`

`str.to-lower`

`str.to-upper`

`str.contains`

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

`math.even`

`math.odd`

`math.zero`


## function definition

    {function sum [a b] (+ a b)}
    {function pi [] (/ 22.0 7.0)}
    