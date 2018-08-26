"use strict";

const Easl = require("../bin/easl.js").Easl;
const easl = new Easl();

const code = `

{let now (date.now)}

{function map (func lst)
    {let i 0}    
    {let list-len (list.length lst)}
    {let res []}
    {while (< i list-len)
         (list.add! res (func (list.get lst i)))
         (set! i (+ i 1))}
    res}

{let range (list.range 0 1-000-000)}
{let lst (map {lambda (e) (* e 2)} range)}

(print (- (date.now) now))
(print (list.last lst))
`;

easl.evaluate(code, {printer: eval_ready}, eval_ready);

function eval_ready(result) {
    if (result !== null) {
        console.log(result);
    }
}
// 2018.08.23 1820
// 2018.08.24 1734
// 2018.08.26 1500
