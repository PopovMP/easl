"use strict";

const examplesList = [
    {
        name: "Fibonacci - tail optimized",
        code:
`
{let fib ( {n 10} )
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
`
{let list.sum { (lst [1 2 3 4 5 6 7 8 9]) }
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
`
{let make-range { (start     0)
                  (length   10)
                  (next     {lambda (cur) (+ cur 10)}) }
    {let loop { (lst  [start])
                (i    1) }
        {if (= i length)
            lst
            (loop (list.add (next (list.last lst)) lst) (+ i 1)) }}}
`
    },


];
