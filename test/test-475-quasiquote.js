"use strict";

const assert         = require("assert");
const {describe, it} = require("mocha");
const Easl           = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("quasiquote", function () {

    it("qq", function () {
        assert.strictEqual(easl.evaluate(` 
               (let five 5)
               (to-string \`(mambo number five))     `), "(mambo number five)");
    });

    it("qq with unquote", function () {
        assert.strictEqual(easl.evaluate(` 
               (let five 5)
               (to-string \`(mambo number ,five))     `), "(mambo number 5)");
    });

    it("qq with unquote-spread", function () {
        assert.strictEqual(easl.evaluate(` 
        (let (foo @baz) '((foo bar) baz))
        (to-string \`(list @ foo , @baz))             `), "(list foo bar baz)");
    });

    it("qq with unquote-spread 2", function () {
        assert.strictEqual(easl.evaluate(` 
            (to-string \`(1 ,(math-sqrt 4) 3 @(list-range 3 4) 7)) 
         `), "(1 2 3 4 5 6 7)");
    });

});
