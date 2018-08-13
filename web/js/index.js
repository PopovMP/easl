"use strict";

const app = {};
const view = {};

function initialize() {
    app.easl = new Easl();

    view.codeAreaElem = document.getElementById("code-area");
    view.buttonRun = document.getElementById("run-button");
    view.codeOutputElem = document.getElementById("code-output");
    view.codeExamplesElem = document.getElementById("select-examples");

    view.buttonRun.addEventListener("click", buttonRun_click);

    setExamples();
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

function exampleLink_click(event) {
    event.preventDefault();
    const exampleName = event.target.innerHTML;
    const example = examplesList.find(e => e.name === exampleName);
    view.codeAreaElem.value = example.code;
    view.codeOutputElem.value = "";
}

function buttonRun_click(event) {
    event.preventDefault();
    runCode(view.codeAreaElem.value);
}

function runCode(codeText) {
    const output = app.easl.evaluate(codeText);
    showOutput(output);
}

function showOutput(output) {
    view.codeOutputElem.value = output;
}
