"use strict";

const Easl = require("../bin/easl.js").Easl;
const easl = new Easl();

const result = easl.evaluate(`

{let now (date.now)}

{let lst []}
{let i   0}

{while (< i 1-000-000)
    {let random  (* (math.random) 100)}
    {let rounded (math.round random)}
    (list.add! rounded lst)
    (set! i (+ i 1)) }

(print (- (date.now) now))

`);

console.log(result);
// 2018.08.23 1420
