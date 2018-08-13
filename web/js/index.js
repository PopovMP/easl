"use strict";

const app = {};
const view = {};

function initialize() {
    app.easl = new Easl();

    view.codeAreaElem = document.getElementById("code-area");
    view.buttonRun = document.getElementById("run-button");
    view.codeOutputElem = document.getElementById("code-output");
    view.codeExamplesElem = document.getElementById("select-examples");



    app.editor = CodeMirror.fromTextArea(view.codeAreaElem, {
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true,
        mode: "easl-mode",
        theme: "easl",
    });

    view.buttonRun.addEventListener("click", buttonRun_click);

    setExamples();
    setDefaultCode();
}

function setExamples() {
    const exampleNames = examplesList.map(e => e.name);
    for (const name of exampleNames) {
        const link = `<a href="#" class="example-link">${name}</a><br />`;
        view.codeExamplesElem.insertAdjacentHTML("beforeend", link);
    }

    const exampleLinks = document.getElementsByClassName("example-link");
    for (const link of exampleLinks) {
        link.addEventListener("click", exampleLink_click);
    }
}

function setDefaultCode() {
    app.editor.getDoc().setValue(examplesList[0].code);
    view.codeOutputElem.value = "";
}

function exampleLink_click(event) {
    event.preventDefault();
    const exampleName = event.target.innerHTML;
    const example = examplesList.find(e => e.name === exampleName);
    app.editor.getDoc().setValue(example.code);
    view.codeOutputElem.value = "";
}

function buttonRun_click(event) {
    event.preventDefault();
    const code = app.editor.getDoc().getValue();
    runCode(code);
}

function runCode(codeText) {
    const output = app.easl.evaluate(codeText);
    showOutput(output);
}

function showOutput(output) {
    view.codeOutputElem.value = output;
}
