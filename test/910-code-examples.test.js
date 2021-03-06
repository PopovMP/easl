"use strict";

const {describe, it} = require("@popovmp/mocha-tiny");
const { Easl }       = require("../public/js/easl.js");
const codeExamples   = require("../public/js/code-examples.js").codeExamples;

const easl = new Easl();

describe("Code examples", function () {
    codeExamples.forEach( (e) => {
        it(e.name, function () {
            easl.evaluate( e.code, {printer: interpreter_print}, eval_ready );
        });
   });
});

function interpreter_print(text) {
    showOutput(text);
}

function eval_ready(output) {
    showOutput(output);
}

function showOutput(text) {
    if (text === undefined) {
        return;
    }

    const output = String(text);

    if (output.match(/^Error:/)) {
        throw Error(output);
    } else {
        console.log( output.trimEnd() );
    }
}
