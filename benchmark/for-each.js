"use strict";

const Easl = require("../bin/easl.js").Easl;
const easl = new Easl();

const result = easl.evaluate(`

{let now (date.now)}

{function for-each (func lst)
    {let i 0}    
    {let list-len (list.length lst)}
    {while (< i list-len)
         (func (list.get i lst))
         (set! i (+ i 1))} }
         
{let res []}
{let range (list.range 0 1-000-000)}

(for-each
    {lambda (e) (list.add! (* e 2) res)}
    range)

(print (- (date.now) now))

`, {libs: ["core-lib", "math-lib", "list-lib", "date-lib"]});

console.log(result);
