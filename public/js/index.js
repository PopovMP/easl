"use strict";

const app = {};

function initialize() {
    const codeMirrorOptions = {
        lineNumbers   : true,
        matchBrackets : true,
        mode          : "easl-mode",
        theme         : "easl",
        indentUnit    : 4,
        indentWithTabs: false,
        tabSize       : 4
    };

    app.easl = new Easl();
    app.view = {};
    app.view.codeAreaElem     = document.getElementById("code-area");
    app.view.buttonRun        = document.getElementById("run-button");
    app.view.codeOutputElem   = document.getElementById("code-output");
    app.view.codeExamplesElem = document.getElementById("select-examples");
    app.editor                = CodeMirror.fromTextArea(app.view.codeAreaElem, codeMirrorOptions);
    app.evalOptions           = {printer: interpreter_print};

    app.view.buttonRun.addEventListener("click", buttonRun_click);

    setExamples();
    setDefaultCode();

    document.addEventListener("keydown", document_keydown);
}

function setExamples() {
    const exampleNames = examplesList.map(function (e) {
        return e.name;
    });
    for (let i = 0; i < exampleNames.length; i++) {
        const name = exampleNames[i];
        const exampleLink = '<a href="#" class="example-link">' + name + '</a><br />';
        app.view.codeExamplesElem.insertAdjacentHTML("beforeend", exampleLink);
    }

    const exampleLinks = document.getElementsByClassName("example-link");
    for (let j = 0; j < exampleLinks.length; j++) {
        const link = exampleLinks[j];
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

function showOutput(text) {
    if (typeof text === "undefined") return;
    app.view.codeOutputElem.value += text;
}

function clearOutput() {
    app.view.codeOutputElem.value = "";
}

function exampleLink_click(event) {
    event.preventDefault();

    const exampleName = event.target.innerHTML;
    for (let i = 0; i < examplesList.length; i++) {
        if (examplesList[i].name === exampleName) {
            app.editor.getDoc().setValue(examplesList[i].code);
            clearOutput();
            return;
        }
    }
}

function buttonRun_click(event) {
    event.preventDefault();
    const code = app.editor.getDoc().getValue();
    runCode(code);
}

function interpreter_print(text) {
    showOutput(text);
}

function eval_ready(output) {
    showOutput(output);
}

function document_keydown(event) {

    // "Ctrl" + "L" inserts λ
    if (event.ctrlKey && event.keyCode === 76) {
        event.preventDefault();
        insertTextInEditor("λ");
    }

    // "Ctrl" + "R" run or F5
    else if (event.ctrlKey && event.keyCode === 82 ||
             event.keyCode === 116) {
        event.preventDefault();
        const code = app.editor.getDoc().getValue();
        runCode(code);
    }

    // "Ctrl" + "K" clear console
    else if (event.ctrlKey && event.keyCode === 75) {
        event.preventDefault();
        clearOutput();
    }
}

function insertTextInEditor(str) {
    const selection = app.editor.getSelection();

    if (selection.length > 0) {
        app.editor.replaceSelection(str);
    } else {
        const doc = app.editor.getDoc();
        const cursor = doc.getCursor();
        const pos = {line: cursor.line, ch: cursor.ch};

        doc.replaceRange(str, pos);
    }
}
