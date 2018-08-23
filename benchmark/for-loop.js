"use strict";

const Easl = require("../bin/easl.js").Easl;
const easl = new Easl();

const result = easl.evaluate(`

{let now (date.now)}

{let lst     []}
{let rand-num 0}
{let rounded  0}

{for (i 0) (< i 1-000-000) (+ i 1)
    {set! rand-num (* (math.random) 100)}
    {set! rounded  (math.round rand-num)}
    (list.add! rounded lst) }

(print (- (date.now) now))

`);

console.log(result);
// 2018.08.23 1290
