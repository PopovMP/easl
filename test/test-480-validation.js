"use strict";

const assert = require("assert");
const {describe, it} = require("mocha");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("Validate application", function () {
    it('((list)) -> error', function () {
        assert.strictEqual(easl.evaluate(` 
                ((list) )              `), 'Error: Improper function application');
    });

    it("((list 1)) -> error", function () {
        assert.strictEqual(easl.evaluate(` 
                ((list 1) )              `), 'Error: Improper function application');
    });

    it("((list 'a)) -> error", function () {
        assert.strictEqual(easl.evaluate(` 
                ((list 'a) )              `), 'Error: Improper function application');
    });

    it("((list + 1)) -> error", function () {
        assert.strictEqual(easl.evaluate(` 
                ((list + 1) )              `), 'Error: Improper function application');
    });

});
