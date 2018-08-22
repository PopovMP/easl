"use strict";

const Easl = require("../bin/easl.js").Easl;
const easl = new Easl();

const result = easl.evaluate(`

{let now (date.now)}

{let lst     []}
{let rand-num 0}
{let rounded  0}
{let i        0}

{while (< i 1-000-000)
    {set! rand-num (* (math.random) 100)}
    {set! rounded  (math.round rand-num)}
    (list.add! rounded lst)
    (set! i (+ i 1)) }

(print (- (date.now) now))

`, {libs: ["core-lib", "math-lib", "list-lib", "date-lib"]});

console.log(result);
