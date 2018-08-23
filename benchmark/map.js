"use strict";

const Easl = require("../bin/easl.js").Easl;
const easl = new Easl();

const result = easl.evaluate(`

{let now (date.now)}

{function map (func lst)
    {let i 0}    
    {let list-len (list.length lst)}
    {let res []}
    {while (< i list-len)
         (list.add! (func (list.get i lst)) res)
         (set! i (+ i 1))}
    res}

{let range (list.range 0 1-000-000)}
{let lst (map {lambda (e) (* e 2)} range)}

(print (- (date.now) now))

`);

console.log(result);
// 2018.08.23 1820
