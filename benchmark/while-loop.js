"use strict";

const Easl = require("../bin/easl.js").Easl;
const easl = new Easl();

const code = `

{let now (date.now)}

{let range (list.range 0 1-000-000)}
{let list-len (list.length range)}
{let lst []}
{let i 0}

{while (< i list-len)
    (list.add! lst (* (list.get range i) 2))
    (set! i (+ i 1)) }

(print (- (date.now) now))
(print (list.last lst))
`;

easl.evaluate(code, {printer: eval_ready}, eval_ready);

function eval_ready(result) {
    if (result !== null) {
        console.log(result);
    }
}

// 2018.08.26 880
