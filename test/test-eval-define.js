"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('define', function () {

    describe('define var', function () {
        it('{define a 2} a → 2', function () {
            assert.strictEqual(easl.evaluate(`    {define a 2} a  `), 2);
        });
        it('{define a 2} {define b 3} a → 2', function () {
            assert.strictEqual(easl.evaluate(`    {define a 2} {define b 3} a  `), 2);
        });
        it('{define a 2} {define b 3} b → 3', function () {
            assert.strictEqual(easl.evaluate(`    {define a 2} {define b 3} 3  `), 3);
        });
        it('{define a 2} {define b (* a 2)} b → 4', function () {
            assert.strictEqual(easl.evaluate(`    {define a 2} {define b (* a 2)} b → 4  `), 4);
        });
        it('{define m 2} ({lambda (a) (* m a)}  2) → 4', function () {
            assert.strictEqual(easl.evaluate(`    {define m 2} ({lambda (a) (* m a)}  2) `), 4);
        });
    });


    describe('define lambda', function () {
        it('no arguments', function () {
            assert.strictEqual(easl.evaluate(` 
                                                {define answer
                                                    {lambda () 42}}
                                                (answer)                                `), 42);
        });

        it('one argument', function () {
            assert.strictEqual(easl.evaluate(` 
                                                {define double
                                                    {lambda (a) (* 2 a)}}
                                                (double 2)                              `), 4);
        });
        it('two arguments', function () {
            assert.strictEqual(easl.evaluate(`    
                                                {define sum
                                                    {lambda (a b) (+ a b)}}
                                                (sum 2 3)                               `), 5);
        });
    });


    describe('define proc', function () {
        it('no arguments', function () {
            assert.strictEqual(easl.evaluate(`
                                                {define (answer) 42}
                                                (answer)
                                                                                        `), 42);
        });

        it('one arguments', function () {
            assert.strictEqual(easl.evaluate(`
                                                {define (double a)
                                                    (* 2 a)}
                                                (double 2)
                                                                                        `), 4);
        });

        it('two arguments', function () {
            assert.strictEqual(easl.evaluate(`
                                                {define (sum a b)
                                                    (+ a b)}
                                                (sum 2 3)
                                                                                        `), 5);
        });

        it('two expressions in the body', function () {
            assert.strictEqual(easl.evaluate(`
                                                {define (sum a b)
                                                    (+ a b)}
                                                (sum 2 3)
                                                                                        `), 5);
        });
    });
});
