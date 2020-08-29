"use strict";

const assert = require("assert");
const {describe, it} = require("@popovmp/mocha-tiny");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('enum', function () {
    it('enum 1 property', function () {
        assert.strictEqual(easl.evaluate("{enum .one} .one"), 0);
    });

    it('enum 2 properties', function () {
        assert.strictEqual(easl.evaluate("{enum .one .two} .two"), 1);
    });

    it('enum existing property', function () {
        assert.strictEqual(easl.evaluate("{let .one 1} {enum .one}"), "Error: Identifier already defined: .one");
    });
});
