// to-do
// add function to scroll recordEle
const calcEle = document.querySelector('#calculator');
const recordEle = document.querySelector('#record');
const displayEle = document.querySelector('#display');
const recordLBtn = document.querySelector('#rec-left-btn');
const recordRBtn = document.querySelector('#rec-right-btn');
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
const defaultDispFontSize = `${pxToRem(window.getComputedStyle(displayEle).fontSize)}rem`;
const defaultRecFontSize = `${pxToRem(window.getComputedStyle(recordEle).fontSize)}rem`;
const defaultRecBtnFontSize = `${pxToRem(window.getComputedStyle(recordLBtn).fontSize)}rem`;
const minFontSize = 0.8; // rem

const numDecimals = 15;
const dispInputLimit = 16;

let prevOper = null,
    tempLastInput = false,
    calcArr = [], // array for calcs
    recordArr = [], // array to join for record display, numbers rounded to specific dp
    dispCalcResult = null, // unrounded, will be rounded when converted to textContent
    displayIsResult = false;

function resetVars() {
    prevOper = null;
    tempLastInput = false;
    calcArr = [];
    recordArr = [];
    dispCalcResult = null;
    displayIsResult = false;
}

function logVars() {
    let tempObj = {prevOper, tempLastInput, calcArr, recordArr, dispCalcResult, displayIsResult};
    console.log(tempObj);
}

function clearEntry() {
    if (calcEle.classList.contains('only-numbers')) {
        clearAll();
    } else if (tempLastInput && displayIsResult) {
        clearLastInput();
    } else if (lastElemOf(recordArr) === identifierSymbol['equals']) {
        clearAll();
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
    if (!displayIsResult && strLenAtLimit(currText, dispInputLimit)) {
        return;
    }
    if (currText === '0') {
        if (str !== '.') {
            currText = str;
        } else {
            currText += str;
        }
    } else if (!(currText.includes('.') && str === '.')) {
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
        recordArr.push(round(newNum, numDecimals+1));
        calcArr.push(newNum);
        calcArr = (calcArr.length > 2) ? [dispCalcResult, lastElemOf(calcArr)] : calcArr;    
        dispCalcResult = prevOperResult(operator);
        displayEle.textContent = round(checkValidity(dispCalcResult));
        displayIsResult = true;
    } else {
        if ([...calcOnNextFuncs.map((identifier) => identifierSymbol[identifier]), identifierSymbol['equals']].includes(lastElemOf(recordArr))) {
            recordArr.pop();
        } else {
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
        recordArr.push(round(newNum, numDecimals+1));
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
    tempRecord = (operator === 'percent') ? round(tempResult, numDecimals+1) : `${identifierSymbol[operator]}(${lastElemOf(recordArr)})`;
    recordArr.pop();
    recordArr.push(tempRecord);
}

function evalEquals(newNum, operator) {
    if (!displayIsResult || displayIsResult && calcOnNextFuncs.map((identifier) => identifierSymbol[identifier]).includes(lastElemOf(recordArr))) {
        recordArr.push(round(newNum, numDecimals+1));
        calcArr.push(newNum);
        calcArr = (calcArr.length > 2) ? [dispCalcResult, lastElemOf(calcArr)] : calcArr;
    } else if (lastElemOf(recordArr) === identifierSymbol['equals']) {
        recordArr.pop();
        if (isNumeric(dispCalcResult) && calcArr.length > 1) {
            calcArr = [dispCalcResult, lastElemOf(calcArr)];
            recordArr = [round(dispCalcResult, numDecimals+1), recordArr[recordArr.length-2], lastElemOf(recordArr)];
        }
    }
    dispCalcResult = prevOperResult(operator);
    displayEle.textContent = round(checkValidity(dispCalcResult));
    displayIsResult = true;
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
    } else if (identifier === 'equals') {
        if (calcEle.classList.contains('only-numbers')) {
            clearAll();
            return;
        }
        evalEquals(currNum, prevOper);
        tempLastInput = false;
        recordArr.push(identifierSymbol[identifier]);
    }
    displayRecord(recordArr);
    if (!isNaN(displayEle.textContent) && identifier === 'equals') {
        addToHistory();
    }
}

function addToHistory() {
    const histCloseBtn = document.querySelector('#close-history-btn');
    const historyContainer = document.querySelector('#history-list');
    const noHistMsg = document.querySelector('#no-history-message');
    noHistMsg.style.display = 'none';

    let historyRecord = document.createElement('div');
    historyRecord.classList.add('history-record');

    let recordEqn = document.createElement('span');
    recordEqn.classList.add('equation');
    recordEqn.textContent = recordEle.textContent;

    let recordResult = document.createElement('span');
    recordResult.classList.add('result');
    recordResult.textContent = displayEle.textContent;

    historyRecord.appendChild(recordEqn);
    historyRecord.appendChild(recordResult);
    saveVarsTo(historyRecord);
    historyRecord.addEventListener('click', () => {
        loadVarsFrom(historyRecord);
        displayHistRecord(historyRecord);
        resetFontSizes();
        fitFont(displayEle, recordEle);
        if (histCloseBtn.style.display !== 'none') {
            histCloseBtn.click();
        }
    })

    const delHistBtn = document.querySelector('#del-history-btn');
    delHistBtn.style.display = 'initial';

    historyContainer.prepend(historyRecord);
    historyRecord.classList.add('faded');
    requestAnimationFrame(() => historyRecord.classList.remove('faded'));
}

function displayHistRecord(record) {
    let equation = record.querySelector('.equation').textContent;
    recordEle.textContent = equation;
    recordArr = getStrAsArr(equation, ' ');
    tempLastInput = true;

    let result = Number(record.querySelector('.result').textContent);
    displayEle.textContent = result;
    displayIsResult = true;
}

function saveVarsTo(record) {
    record.dataset.oper = prevOper;
    record.dataset.calcarr = calcArr.join(',');
    record.dataset.dispresult = dispCalcResult;
}

function loadVarsFrom(record) {
    prevOper = (record.dataset.oper === 'null') ? null : record.dataset.oper;
    calcArr = getStrAsArr(record.dataset.calcarr, ',');
    dispCalcResult = Number(record.dataset.dispresult);
}

function deleteHistory() {
    const historyContainer = document.querySelector('#history-list');
    const noHistMsg = document.querySelector('#no-history-message');
    noHistMsg.style.display = 'initial';

    while (historyContainer.firstChild) {
        historyContainer.removeChild(historyContainer.lastChild);
    }

    const delHistBtn = document.querySelector('#del-history-btn');
    delHistBtn.style.display = 'none';
}

function checkValidity(result) {
    result = (result === Infinity || result === -Infinity) ? 'Overflow' : result;
    if (!isNumeric(result)) {
        disableOperators();
    }
    return result;
}

function isNumeric(a) {
    return Number.isFinite(a);
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

function getStrAsArr(str, sep) {
    let temp = str.split(sep);
    temp = temp.map((elem) => elem = !isNaN(elem) ? Number(elem) : elem);
    return temp;
}

function round(num, dp = numDecimals) {
    let temp = Number("1"+"0".repeat(dp))
    return (!isNaN(num)) ? Math.round(num*temp)/temp : num;
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
        btn.addEventListener('click', () => {
            numberInput(btn.textContent);
            fitFont(displayEle);
        })
    })

    const mainBtns = document.querySelectorAll('.operator, .display-edit');
    mainBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            resetFontSizes();
            fitFont(displayEle, recordEle);
        })
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

function resetFontSizes() {
    displayEle.style.fontSize = defaultDispFontSize;
    recordEle.style.fontSize = defaultRecFontSize;
    recordLBtn.style.fontSize = defaultRecBtnFontSize;
    recordRBtn.style.fontSize = defaultRecBtnFontSize;
}

function strLenAtLimit(str, limit) {
    let onlyLetters = str.replace('.','');
    return onlyLetters.length >= limit;
}

function fitFont() {    // assumes elem with font to fit is within a container, accepts multiple elems
    for (let i = 0; i < arguments.length; i++) {
        
        let elem = arguments[i];
        let isFlexEnd;
        if (window.getComputedStyle(elem).alignSelf === 'flex-end') {
            elem.style.alignSelf = 'flex-start';
            isFlexEnd = true;
        }

        let currFontSize = pxToRem(window.getComputedStyle(elem).fontSize);
        let heightReq = elem.parentElement.scrollHeight;
        let heightNow = elem.parentElement.clientHeight;
        let widthReq = elem.parentElement.scrollWidth;
        let widthNow = elem.parentElement.clientWidth;
        while (heightReq > heightNow || widthReq > widthNow) {
            widthNow = elem.parentElement.clientWidth;
            heightNow = elem.parentElement.clientHeight;
            currFontSize -= 0.1;
            currFontSize = round(currFontSize, 1);
            elem.style.fontSize = `${currFontSize}rem`;
            heightReq = elem.parentElement.scrollHeight;
            widthReq = elem.parentElement.scrollWidth;
            if (currFontSize <= minFontSize) {
                break;
            }
        }
        
        if (isFlexEnd) {
            elem.style.alignSelf = 'flex-end';
        }
    }
}

function pxToRem(str) {
    const rootSize = window.getComputedStyle(document.body).fontSize;

    let pxNum = Number(str.slice(0, -2));
    let rootNum = Number(rootSize.slice(0, -2));
    return pxNum/rootNum;
}

function enableResizeEvents() {
    fitFont(displayEle, recordEle, recordLBtn, recordRBtn);
    window.addEventListener('resize', () => {
        resetFontSizes();
        fitFont(displayEle, recordEle, recordLBtn, recordRBtn);
    });
}

function load() {
    enableButtons();
    enableKeyPress();
    enableResizeEvents();
    resetVars();
}

load();