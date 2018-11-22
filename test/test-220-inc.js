"use strict";

const assert = require("assert");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('inc', function () {
    it('inc val', function () {
        assert.strictEqual(easl.evaluate(`
            {let a 1}
            {inc a}
            a                           `), 2);
    });

    it('inc val delta', function () {
        assert.strictEqual(easl.evaluate(`
            {let a 1}
            {inc a 2}
            a                           `), 3);
    });

    it('inc returns the value', function () {
        assert.strictEqual(easl.evaluate(`
            {let a 5}
            {inc a}                     `), 6);
    });

    it('inc unbound identifier', function () {
        assert.strictEqual(easl.evaluate(`
            {inc a 1}                   `), "Error: Unbound identifier: a");
    });
});
