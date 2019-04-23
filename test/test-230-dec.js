"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../bin/easl.js").Easl;

const easl = new Easl();

describe('dec', function () {
    it('dec val', function () {
        assert.strictEqual(easl.evaluate(`
            {let a 2}
            {dec a}
            a                           `), 1);
    });

    it('dec val delta', function () {
        assert.strictEqual(easl.evaluate(`
            {let a 5}
            {dec a 2}
            a                           `), 3);
    });

    it('dec returns the value', function () {
        assert.strictEqual(easl.evaluate(`
            {let a 5}
            {dec a}                     `), 4);
    });

    it('dec unbound identifier', function () {
        assert.strictEqual(easl.evaluate(`
            {dec a 1}                   `), "Error: Unbound identifier: a");
    });
});
