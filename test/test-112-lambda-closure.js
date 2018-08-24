"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();


describe('lambda - closure', function () {
    it('closure - 1 free param', function () {
        assert.strictEqual(easl.evaluate(`
        (({lambda a
            {lambda b (+ a b) }} 1) 2)
                                            `), 3);
    });
});
