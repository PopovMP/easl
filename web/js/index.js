"use strict";

const app = {};

function initialize() {
    app.easl = new Easl();

    app.view = {};
    app.view.codeAreaElem = document.getElementById("code-area");
    app.view.buttonRun = document.getElementById("run-button");
    app.view.codeOutputElem = document.getElementById("code-output");
    app.view.codeExamplesElem = document.getElementById("select-examples");

    app.editor = CodeMirror.fromTextArea(app.view.codeAreaElem, {
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true,
        mode: "easl-mode",
        theme: "easl",
    });

    app.view.buttonRun.addEventListener("click", buttonRun_click);

    app.evalOptions = {printer: interpreter_print};

    setExamples();
    setDefaultCode();
}

function setExamples() {
    const exampleNames = examplesList.map(e => e.name);
    for (const name of exampleNames) {
        const link = `<a href="#" class="example-link">${name}</a><br />`;
        app.view.codeExamplesElem.insertAdjacentHTML("beforeend", link);
    }

    const exampleLinks = document.getElementsByClassName("example-link");
    for (const link of exampleLinks) {
        link.addEventListener("click", exampleLink_click);
    }
}

function setDefaultCode() {
    app.editor.getDoc().setValue(examplesList[0].code);
    clearOutput();
}

function runCode(codeText) {
    clearOutput();
    app.easl.evaluate(codeText, app.evalOptions, eval_ready);
}

function eval_ready(output) {
    showOutput(output);
}

function showOutput(output) {
    if (output !== null) {
        app.view.codeOutputElem.value += output;
    }
}

function clearOutput() {
    app.view.codeOutputElem.value = "";
}

function exampleLink_click(event) {
    event.preventDefault();
    const exampleName = event.target.innerHTML;
    const example = examplesList.find(e => e.name === exampleName);
    app.editor.getDoc().setValue(example.code);
    clearOutput();
}

function buttonRun_click(event) {
    event.preventDefault();
    const code = app.editor.getDoc().getValue();
    runCode(code);
}

function interpreter_print(text) {
    if (text !== null) {
        showOutput(text + "\n");
    }
}
