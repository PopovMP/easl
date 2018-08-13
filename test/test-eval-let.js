"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('let', function () {

    describe('let proc-id', function () {
        it('{let f ((a 1)) a} → 1', function () {
            assert.strictEqual(easl.evaluate(`    {let f ((a 1)) a}   `), 1);
        });

        it('{let f ((a (+ 1 2)) a} → 3', function () {
            assert.strictEqual(easl.evaluate(`    {let f ( (a (+ 1 2)) ) a}   `), 3);
        });

        it('{let f ((a [1 2 3])) a} → [1, 2, 3]', function () {
            assert.deepStrictEqual(easl.evaluate(`    {let f ((a [1 2 3])) a}   `), [1, 2, 3]);
        });

        it('count of list elements', function () {
            assert.strictEqual(easl.evaluate(`   
                                                 {let count ( (lst [1 2 3 4 5])
                                                              (cnt 0) )
                                                   {if (null? lst)
                                                       cnt
                                                       (count (list.rest lst)
                                                              (+ cnt 1))}}    `), 5);
        });

        it('factorial 5  → 120', function () {
            assert.strictEqual(easl.evaluate(`   
                                               {let fac ( (n 5) )
                                                  (if (= n 0)
                                                      1
                                                      (* n (fac (- n 1))))}     `), 120);
        });

        it('nested let proc', function () {
            assert.strictEqual(easl.evaluate(`   
                                               {let f1 ( {a 1} )
                                                  {let f2 ( {b 2} )
                                                      (+ a b) }}               `), 3);
        });

    });


    describe('let', function () {
        it('(let ((a 5)) (+ a a)) → 10', function () {
            assert.strictEqual(easl.evaluate(`   (let ((a 5)) (+ a a))   `), 10);
        });

        it('(let ((a 5)) 5 (+ a a)) → 10', function () {
            assert.strictEqual(easl.evaluate(`   (let ((a 5)) 5 (+ a a))  `), 10);
        });

        it('Two variables', function () {
            assert.strictEqual(easl.evaluate(`  
                                                {let ((a 5) 
                                                      (c (+ 20 10)))
                                                  (+ a a)
                                                  (+ c a)}                                 `), 35);
        });

        it('lambda', function () {
            assert.strictEqual(easl.evaluate(`  
                                                {let ({f (lambda (a b) (+ a b))})
                                                   (f 2 3)}                               `), 5);
        });

        it('lambda lambda', function () {
            assert.strictEqual(easl.evaluate(`  
                                                (let ( {a 1} )
                                                     (({lambda () 
                                                          {lambda (b) (+ b a)}}) 2))      `), 3);
        });
    });


    describe('let*', function () {
        it('One proc', function () {
            assert.strictEqual(easl.evaluate(`  
                                                   {let* ( {sum (lambda (a b) (+ a b))}
                                                           {a 1}
                                                           {b 2}
                                                           {c (+ a b)} )
                                                      5
                                                      (sum (sum a b) c)}                  `), 6);
        });

        it('let* in let', function () {
            assert.strictEqual(easl.evaluate(`  
                                                  {let ( {x 2}
                                                         {y 3} )
                                                     (let* ( {x 7}
                                                             {z (+ x y)} )
                                                        (* z x))}                         `), 70);
        });
    });

    describe('letrec', function () {
        it('one proc', function () {
            assert.strictEqual(easl.evaluate(`  
                                   {letrec ( {f (lambda () 5)} ) (f)}             `), 5);
        });
        it('one proc, one param', function () {
            assert.strictEqual(easl.evaluate(`  
                                   {letrec ( {f (lambda (a) (+ 2 a))} ) (f 1)}     `), 3);
        });

        it('factorial', function () {
            assert.strictEqual(easl.evaluate(`  
                                   {letrec ( {fac {lambda (n)
                                                     {if (= n 0)
                                                         1
                                                         (* (fac (- n 1)) n)}}} )
                                        (fac 5)}                                         `), 120);
        });

        it('mutual recursion', function () {
            assert.strictEqual(easl.evaluate(`  
                                    {letrec
                                        ( {is-even? (lambda (n) (or  (zero? n)
                                                                     (is-odd? (sub1 n))))}
                                          {is-odd?  (lambda (n) (and (not (zero? n))
                                                                     (is-even? (sub1 n))))} )
                                        (is-odd? 3)}                                           `), true);
        });
    });

});
