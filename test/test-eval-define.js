"use strict";

const assert = require("assert");
const Application = require("../index").Application;

const app = new Application();

describe('define', function () {

    describe('define var', function () {
        it('{define a 2} a → 2', function () {
            assert.strictEqual(app.evaluate(`    {define a 2} a  `), 2);
        });
        it('{define a 2} {define b 3} a → 2', function () {
            assert.strictEqual(app.evaluate(`    {define a 2} {define b 3} a  `), 2);
        });
        it('{define a 2} {define b 3} b → 3', function () {
            assert.strictEqual(app.evaluate(`    {define a 2} {define b 3} 3  `), 3);
        });
        it('{define a 2} {define b (* a 2)} b → 4', function () {
            assert.strictEqual(app.evaluate(`    {define a 2} {define b (* a 2)} b → 4  `), 4);
        });
        it('{define m 2} ({lambda (a) (* m a)}  2) → 4', function () {
            assert.strictEqual(app.evaluate(`    {define m 2} ({lambda (a) (* m a)}  2) `), 4);
        });
    });


    describe('define lambda', function () {
        it('{define double {lambda (a) (* 2 a)}} (double 2) → 4', function () {
            assert.strictEqual(app.evaluate(`    {define double {lambda (a) (* 2 a)}} (double 2)   `), 4);
        });
    });


    // describe('define proc', function () {
    //     it('define proc', function () {
    //         assert.strictEqual(app.evaluate(`
    //
    //             {define (sum a b) (+ a b)}
    //             (sum 2 3)
    //
    //
    //                                                                 `), 7);
    //     });
    // });

});
