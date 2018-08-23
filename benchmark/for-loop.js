"use strict";

const Easl = require("../bin/easl.js").Easl;
const easl = new Easl();

const result = easl.evaluate(`

{let now (date.now)}

{let lst []}

{for (i 0) (< i 1-000-000) (+ i 1)
    {let random  (* (math.random) 100)}
    {let rounded (math.round random)}
    (list.add! rounded lst) }

(print (- (date.now) now))

`);

console.log(result);
// 2018.08.23 1380
