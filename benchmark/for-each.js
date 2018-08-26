"use strict";

const Easl = require("../bin/easl.js").Easl;
const easl = new Easl();

const code = `

{let now (date.now)}

{function for-each (func lst)
    {let i 0}    
    {let list-len (list.length lst)}
    {while (< i list-len)
         (func (list.get lst i))
         (set! i (+ i 1))} }
         
{let range (list.range 0 1-000-000)}
{let res []}

(for-each {lambda (e) (list.add! res (* e 2))} range)

(print (- (date.now) now))
(print (list.last res))
`;

easl.evaluate(code, {printer: eval_ready}, eval_ready);

function eval_ready(result) {
    if (result !== null) {
        console.log(result);
    }
}
// 2018.08.23 1830
// 2018.08.24 1718
// 2018.08.26 1480
