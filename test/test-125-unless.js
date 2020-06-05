"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe('unless', function () {
    it('(unless false 1 2) → undefined', function () {
        assert.strictEqual(easl.evaluate("(unless false 1 2)"), undefined);
    });

    it('(unless true 1 2) → undefined', function () {
        assert.strictEqual(easl.evaluate("(unless true 1 2)"), undefined);
    });
});
