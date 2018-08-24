"use strict";

const Easl = require("../bin/easl.js").Easl;
const easl = new Easl();

const code = `

{let now (date.now)}

{let lst []}

{for (i 0) (< i 1-000-000) (+ i 1)
    {let random  (* (math.random) 100)}
    {let rounded (math.round random)}
    (list.add! rounded lst) }

(print (- (date.now) now))

`;

easl.evaluate(code, {printer: eval_ready}, eval_ready);

function eval_ready(result) {
    if (result !== null) {
        console.log(result);
    }
}

// 2018.08.23 1380
// 2018.08.24 1319
