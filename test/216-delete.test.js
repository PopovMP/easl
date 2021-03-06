"use strict";

const assert = require("assert");
const {describe, it} = require("@popovmp/mocha-tiny");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('delete', function () {
    it('delete var', function () {
        assert.strictEqual(easl.evaluate(`
            {let a 1}
            {delete a}
            a                           `),
            'Error: Unbound identifier: a');
    });

    it('delete lambda', function () {
        assert.strictEqual(easl.evaluate(`
            {let a {lambda () 1 }}
            {delete a}
            (a)                         `),
            'Error: Unbound identifier: a');
    });

    it('delete function', function () {
        assert.strictEqual(easl.evaluate(`
            {let foo () 1}
            {delete foo}
            foo                         `),
            'Error: Unbound identifier: foo');
    });

    it('delete correct function', function () {
        assert.strictEqual(easl.evaluate(`
            {let foo () 1}
            {let bar () (+ 1 2)}
            {delete foo}
            (bar)                       `), 3);
    });

    it('delete returns undefined', function () {
        assert.strictEqual(easl.evaluate(`
            {let a 5}
            {delete a}                 `), undefined);
    });

    it('delete unbound identifier', function () {
        assert.strictEqual(easl.evaluate(`
            {delete a}                 `),
            "Error: 'delete' unbound identifier: a");
    });

    it('delete unbound identifier', function () {
        assert.strictEqual(easl.evaluate(`
            {delete a 1}                 `),
            "Error: 'delete' requires 1 argument. Given: 2");
    });
});
