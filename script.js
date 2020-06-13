// to-do
// display numbers correctly (account for floating pt error)
// resize font size dynamically
const calcEle = document.querySelector('#calculator');
const recordEle = document.querySelector('#record');
const displayEle = document.querySelector('#display');
const immediateFuncs = ['percent', 'inverse', 'squared', 'sqrt', 'negative'];
const calcOnNextFuncs = ['divide', 'multiply', 'subtract', 'add'];
const identifierSymbol = {
    'divide': '\u00f7',
    'multiply': '\u00d7',
    'subtract': '\u2212',
    'add': '\u002b',
    'inverse': '1/',
    'squared': 'sqr',
    'sqrt': '\u221a',
    'negative': 'negate',
    'equals': '\u003d'
}
const validKeysToID = {
    '%': 'percent',
    'Delete': 'clear-entry',
    'Escape': 'clear-all',
    'Backspace': 'backspace', 
    'r': 'inverse',
    'q': 'squared',
    '@': 'sqrt',
    '/': 'divide',
    '*': 'multiply',
    '-': 'subtract',
    '+': 'add',
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    'F9': 'negative',
    '.': 'decimal',
    '=': 'equals',
    'Enter': 'equals'
}

let prevOper = null,
    tempLastInput = false,
    calcArr = [], // array for calcs
    recordArr = [], // array to join for record display, numbers rounded to specific dp
    prevCalcResult = null, // unrounded
    dispCalcResult = null, // unrounded, will be rounded when converted to textContent
    displayIsResult = false;

// immediate operators operate on the display number if NOT displayIsResult OR if displayIsResult but last element of recordArr is a delayed operator, and on the last value of calcArr if displayIsResult but last element is not a delayed operator

// once a delayed operator is pressed, any prev delayed operator is evaluated and any immediate operator is operated on the shown result
// once a number is pressed, any immediate operator is operated on the shown number
// once an immediate operator is pressed, it is operated on the last number
// for records that end with equals (i.e. frm history), any immediate operator is operated on the last number

// DRAFT PROCESS
// so basically, on pressing any number
    // number input (old code should work, but need to edit negative to work in the same way as an immediate operator (takes in a number and returns another)
    // if displayIsResult
        // if tempLastInput (history or imm oper), clearEntry and clearLastInput
        // else (equals button or delayed oper), clearAll if equals, clearEntry O.W.

// on pressing any delayed operator, 
    // if NOT displayIsResult (number input)
        // append display number to calcArr
        // if more than 2 numbers, replace first 2 with dispCalcResult
        // if dispCalcResult is not null, update prevCalcResult with dispCalcResult
        // calculate if calcArr is not empty (return only elem of calcArr if <2 elems)
        // update dispCalcResult, display it
        // displayIsResult becomes true
    // else if displayIsResult
        // if last element of recordArr is a delayed operator or equals
            // pop the last element of recordArr
        // if not 
            // (appending done by the first press of immediate operator)
            // if dispCalcResult is not null, update prevCalcResult with dispCalcResult
            // calculate if calcArr is not empty (return only elem of calcArr if <2 elems)
            // update dispCalcResult, display it
    // update prevOper with the delayed operator
    // tempLastInput becomes false
    // update recordArr

// on pressing any immediate operator
    // if NOT displayIsResult OR if displayIsResult AND last element of recordArr is a delayed operator (number pressed or delayed operator pressed)
        // if NOT displayIsResult AND operator is "negative"
            // do negative function on display number
            // return
        // append (display number if NOT displayIsResult, dispCalcResult O.W) to calcArr
        // if more than 2 numbers, replace first 2 with dispCalcResult
        // update recordArr using last elem of calcArr (except percent)
    // else if displayIsResult AND last element of recordArr is NOT a delayed operator (equals or prev imm operator)
        // if last elem of recordArr is "="
            // pop the last elem of recordArr
        // update recordArr using last elem of recordArr (except percent)
    // displayIsResult becomes true
    // tempLastInput becomes true
    // calculate on the last element (both for percent, 0 as a if only 1 element) of calcArr and replace the element after calc
    // if percent was done, update recordArr using last elem of calcArr as well

// equals button
    // if NOT displayIsResult OR if displayIsResult AND last element of recordArr is a delayed operator (number pressed or delayed operator pressed)
        // append (display number if NOT displayIsResult, dispCalcResult O.W) to calcArr
        // if more than 2 numbers, replace first 2 with dispCalcResult
        // if dispCalcResult is not null, update prevCalcResult with dispCalcResult
        // calculate if calcArr is not empty (return only elem of calcArr if <2 elems)
        // update dispCalcResult, display it
        // displayIsResult becomes true
    // else if displayIsResult
        // if last element of recordArr is equals (from history or repeating equals)
            // pop the last elem of recordArr
            // if dispCalcResult is not null
                // update prevCalcResult with dispCalcResult
                // calcArr = [dispCalcResult, last elem of calcArr]
                // recordArr = [dispCalcResult, last 2 elem of recordArr]
            // calculate if calcArr is not empty (return only elem of calcArr if <2 elems)
            // update dispCalcResult, display it
        // if not 
            // (appending done by the first press of immediate operator)
            // if dispCalcResult is not null, update prevCalcResult with dispCalcResult
            // calculate if calcArr is not empty (return only elem of calcArr if <2 elems)
            // update dispCalcResult, display it
    // update recordArr
    // tempLastInput becomes false
    // save prevOper, prevCalcResult, dispCalcResult to html dataset
    // save record textContent and display textContent to history displays

function resetVars() {
    prevOper = null;
    tempLastInput = false;
    calcArr = [];
    recordArr = [];
    prevCalcResult = null;
    dispCalcResult = null;
    displayIsResult = false;
}

function logVars() {
    let tempObj = {prevOper, tempLastInput, calcArr, recordArr, prevCalcResult, dispCalcResult, displayIsResult};
    console.log(tempObj);
}

function clearEntry() {
    if (calcEle.classList.contains('only-numbers')) {
        clearAll();
    } else if (tempLastInput) {
        clearLastInput();
    }
    displayEle.textContent = '0';
    displayIsResult = false;
}

function clearLastInput() {
    if (lastElemOf(recordArr) === identifierSymbol['equals']) {
        recordArr.pop();
    }
    recordArr.pop();
    calcArr.pop();

    if (recordArr.length > 0) {
        displayRecord(recordArr);
    }
}

function clearAll() {
    if (calcEle.classList.contains('only-numbers')) {
        enableOperators();
    }
    resetVars();
    clearEntry();
    recordEle.textContent = '';
}

function backspace() {
    if (calcEle.classList.contains('only-numbers')) {
        clearAll();
    } else if (!displayIsResult) {
        let currText = displayEle.textContent;
        if (currText.length === 2 && currText[0] === '-') {
            displayEle.textContent = '0';
        } else if (currText.length > 1) {
            displayEle.textContent = currText.substring(0, currText.length - 1);
        } else {
            displayEle.textContent = '0';
        }
    }
}

function percent(a, b) {
    return a*b/100;
}

function inverse(a) {
    return divide(1, a);
}

function squared(a) {
    return a*a;
}

function sqrt(a) {
    return (a >= 0) ? Math.sqrt(a) : "Invalid input";
}

function divide(a, b) {
    return (b != 0) ? a/b : "Cannot divide by zero";
}

function multiply(a, b) {
    return a*b;
}

function subtract(a, b) {
    return a-b;
}

function add(a, b) {
    return a+b;
}

function negative(a) {
    return -a;
}

function numberInput(str) {
    if (calcEle.classList.contains('only-numbers')) {
        clearAll();
    } else if (displayIsResult) {
        if (tempLastInput) {
            clearEntry();
        } else if (lastElemOf(recordArr) === identifierSymbol['equals']) {
            clearAll();
        } else {
            clearEntry();
        }
    }
    let currText = displayEle.textContent;
    if (currText === '0') {
        if (str !== '.') {
            currText = str;
        } else {
            currText += str;
        }
    } else if (!(currText[currText.length - 1] === '.' && str === '.')) {
        currText += str;
    }
    displayEle.textContent = currText;
}

function prevOperResult(operator) {
    let result;
    if (calcArr.length === 2) {
        switch(operator) {
            case 'divide':
                result = divide(...calcArr);
                break;
            case 'multiply':
                result = multiply(...calcArr);
                break;
            case 'subtract':
                result = subtract(...calcArr);
                break;
            case 'add':
                result = add(...calcArr);
        }
    } else if (calcArr.length === 1) {
        result = calcArr[0];
    }
    return result;
}

function evalPrevOper(newNum, operator) {
    if (!displayIsResult) {
        recordArr.push(round(newNum));
        calcArr.push(newNum);
        calcArr = (calcArr.length > 2) ? [dispCalcResult, lastElemOf(calcArr)] : calcArr;
        prevCalcResult = (dispCalcResult) ? dispCalcResult : null;        
        dispCalcResult = prevOperResult(operator);
        displayEle.textContent = round(checkValidity(dispCalcResult));
        displayIsResult = true;
    } else {
        if ([...calcOnNextFuncs.map((identifier) => identifierSymbol[identifier]), identifierSymbol['equals']].includes(lastElemOf(recordArr))) {
            recordArr.pop();
        } else {
            prevCalcResult = (dispCalcResult) ? dispCalcResult : null;
            dispCalcResult = prevOperResult(operator);
            displayEle.textContent = round(checkValidity(dispCalcResult));
        }
    }
}

function immOperResult(operator) {
    let result;
    let num = lastElemOf(calcArr);
    switch (operator) {
        case 'percent':
            result = (calcArr.length === 1) ? 0 : percent(...calcArr);
            break;
        case 'inverse':
            result = inverse(num);
            break;
        case 'squared':
            result = squared(num);
            break;
        case 'sqrt':
            result = sqrt(num);
            break;
        case 'negative':
            result = negative(num);
    }
    return result;
}

function evalImmOper(newNum, operator) {
    if (!displayIsResult || displayIsResult && calcOnNextFuncs.map((identifier) => identifierSymbol[identifier]).includes(lastElemOf(recordArr))) {
        if (!displayIsResult && operator === 'negative') {
            displayEle.textContent = negative(newNum);
            return;
        }
        recordArr.push(round(newNum));
        calcArr.push(newNum);
        calcArr = (calcArr.length > 2) ? [dispCalcResult, lastElemOf(calcArr)] : calcArr;
    } else if (lastElemOf(recordArr) === identifierSymbol['equals']) {
        recordArr.pop();
    }
    let tempResult;
    tempResult = immOperResult(operator);
    calcArr.pop();
    calcArr.push(tempResult);
    displayEle.textContent = round(checkValidity(tempResult));
    displayIsResult = true;

    let tempRecord;
    tempRecord = (operator === 'percent') ? round(tempResult) : `${identifierSymbol[operator]}(${lastElemOf(recordArr)})`;
    recordArr.pop();
    recordArr.push(tempRecord);
}

function operatorInput(identifier) {
    let currNum = (displayIsResult) ? dispCalcResult : Number(displayEle.textContent);
    if (calcOnNextFuncs.includes(identifier)) {
        evalPrevOper(currNum, prevOper);
        prevOper = identifier;
        tempLastInput = false;
        recordArr.push(identifierSymbol[identifier]);
    } else if (immediateFuncs.includes(identifier)) {
        evalImmOper(currNum, identifier);
        tempLastInput = true;
    }
    displayRecord(recordArr);
    logVars();
}

// equals func
// history funcs

function checkValidity(result) {
    result = (result === Infinity || result === -Infinity) ? 'Overflow' : result;
    if (isNaN(result)) {
        disableOperators();
    }
    return result;
}

function buttonInput(e) {
    let activeKey = calcEle.querySelector(`#calculator > button[id='${validKeysToID[e.key]}']`);
    if (activeKey) {
        activeKey.click();
    }
}

function lastElemOf(arr) {
    return arr[arr.length-1];
}

function displayRecord(arr) {
    recordEle.textContent = arr.join(' ');
}

function getEquationAsArr(str) {
    return str.split(' ');
}

function isNumeric(str) {
    return !isNaN(str);
}

function round(num) {
    return (!isNaN(num)) ? Math.round(num*100000000)/100000000 : num;
}

function toggleDarkMode() {
    const themeLightText = document.querySelector('#theme-light-label');
    const themeDarkText = document.querySelector('#theme-dark-label');
    document.body.classList.toggle('dark-mode');
    themeLightText.classList.toggle('bold-label');
    themeDarkText.classList.toggle('bold-label');
}

function enableButtons() {
    const themeToggle = document.querySelector('#toggle-theme');
    themeToggle.addEventListener('click', () => toggleDarkMode());

    const histBtn = document.querySelector('#history-btn');
    histBtn.addEventListener('click', () => {
        calcEle.classList.toggle('history');
    })
    
    const histCloseBtn = document.querySelector('#close-history-btn');
    histCloseBtn.addEventListener('click', () => {
        if (calcEle.classList.contains('history')) {
            calcEle.classList.toggle('history');
        }
    })

    const delHistBtn = document.querySelector('#del-history-btn');
    delHistBtn.addEventListener('click', () => deleteHistory());

    const clearAllBtn = document.querySelector('#clear-all');
    clearAllBtn.addEventListener('click', () => clearAll());

    const clearEntryBtn = document.querySelector('#clear-entry');
    clearEntryBtn.addEventListener('click', () => clearEntry());

    const backspaceBtn = document.querySelector('#backspace');
    backspaceBtn.addEventListener('click', () => backspace());

    const operatorBtns = document.querySelectorAll('.operator');
    operatorBtns.forEach(btn => {
        btn.addEventListener('click', () => operatorInput(btn.id));
    })

    const numberBtns = document.querySelectorAll('.number');
    numberBtns.forEach(btn => {
        btn.addEventListener('click', () => numberInput(btn.textContent));
    })
}

function enableKeyPress() {
    window.addEventListener('keydown', (e) => buttonInput(e))
}

function disableOperators() {
    calcEle.classList.toggle('only-numbers');
    const operatorBtns = document.querySelectorAll('.operator');
    operatorBtns.forEach(btn => {
        if (btn.id !== 'equals') {
            btn.disabled = true;
        }
    });

    const decimalBtn = document.querySelector('#decimal');
    decimalBtn.disabled = true;
}

function enableOperators() {
    calcEle.classList.toggle('only-numbers');
    const operatorBtns = document.querySelectorAll('.operator');
    operatorBtns.forEach(btn => btn.disabled = false);

    const decimalBtn = document.querySelector('#decimal');
    decimalBtn.disabled = false;
}

function load() {
    enableButtons();
    enableKeyPress();
    resetVars();
}

load();