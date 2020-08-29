"use strict";

const assert = require("assert");
const {describe, it} = require("@popovmp/mocha-tiny");
const Easl = require("../public/js/easl.js").Easl;

const easl = new Easl();

describe("Line comment", function () {
    it("; line comment", function () {
        assert.strictEqual(easl.evaluate( `
            ; line comment
            ` ), undefined);
    });

    it("1 ; line comment", function () {
        assert.strictEqual(easl.evaluate( `
            1 ; line comment
            ` ), 1);
    });
});

describe("Multiline comment", function () {
    it("#| |#", function () {
        assert.strictEqual(easl.evaluate( `
            #| comment |#
            ` ), undefined);
    });

    it("1 #| |#", function () {
        assert.strictEqual(easl.evaluate( `
            1 #| comment |#
            ` ), 1);
    });

    it(" 1 #| |# 2", function () {
        assert.strictEqual(easl.evaluate( `
            1 #| comment |# 2
            ` ), 2);
    });

    it("#| \n |#", function () {
        assert.strictEqual(easl.evaluate( `
            #| 
              comment
            |#
            ` ), undefined);
    });

    it("#| \n |# 1", function () {
        assert.strictEqual(easl.evaluate( `
            #| 
              comment
            |#
            1
            ` ), 1);
    });
});
