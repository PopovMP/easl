"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('set!', function () {
    it('set val', function () {
        assert.strictEqual(easl.evaluate(`

        {let  a 1}
        {set! a 2}
        a

        `), 2);
    });
    it('set lambda', function () {
        assert.strictEqual(easl.evaluate(`

        {let  a {lambda () (1) }}
        {set! a {lambda () (2) }}
        (a)

        `), 2);
    });
});
