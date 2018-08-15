"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();


describe('lambda - closure', function () {
    xit('closure - 1 free param', function () {
        assert.strictEqual(easl.evaluate(`
        
        ( ({lambda (a)
               {lambda () (a)}})  1)
                                            `, true), 1);
    });


    xit('Currying', function () {
        assert.strictEqual(easl.evaluate(`
        
        ( ({lambda (a)
               {lambda (b) (+ a b)}} 5)  6)`), 11);
    });
});
