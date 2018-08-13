"use strict";

const examplesList = [
    {
        name: "List length",
        code:
`{define lst [1 2 3 4]}

(list.length lst)
`
    },


    {
        name: "Swap list elements non destructive",
        code:
`{define lst [1 2 3]}

{define swap {lambda (i1 i2 lst)
                (list.set (list.get i1 lst)
                          i2
                          (list.set (list.get i2 lst)
                                    i1
                                    lst)) }}

(swap 0 2 lst)
`
    },

    {
        name: "Fibonacci - tail optimized",
        code:
`{let fib ( {n 10} )
    {let loop ( {i     2}
                {prev  1}
                {cur   1} )
        {if (= i n)
            cur
            (loop (+ i 1) cur (+ prev cur)) }}}
`
    },
    {
        name: "Sum elements of a list",
        code:
`{let list.sum { (lst [1 2 3 4 5 6 7 8 9]) }
    {let loop { (i   (list.length lst))
                (sum 0) }
        {if (= i -1)
            sum
            (loop (- i 1) (+ (list.get i lst) sum)) }}}
`
    },
    {
        name: "Arithmetic progression",
        code:
`{let make-range { (start     0)
                  (length   10)
                  (next     {lambda (cur) (+ cur 10)}) }
    {let loop { (lst  [start])
                (i    1) }
        {if (= i length)
            lst
            (loop (list.add (next (list.last lst)) lst) (+ i 1)) }}}
`
    },
    {
        name: "Find max of list recursive",
        code:
`{define (list-max lst)
    {define (loop rest max)
        {if (null? rest)
            max
            (loop (list.rest rest)
                  (if (> (list.first rest)  max)
                      (list.first rest)
                      max)) }}
    (loop lst (list.first lst))}


(list-max [27432 34 3214 526 62 2])
`
    },


];
