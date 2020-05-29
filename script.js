const recordEle = document.querySelector('#record');
const displayEle = document.querySelector('#display');
const validKeys = [ '%',    'Delete',   'Escape',   'Backspace', 
                    'r',    'q',        '@',        '/',
                    '7',    '8',        '9',        '*',
                    '4',    '5',        '6',        '-',
                    '1',    '2',        '3',        '+',
                    'F9',   '0',        '.',        '=', 'Enter']
const immediateFuncs = ['percent', 'inverse', 'squared', 'sqrt'];
const calcOnNextFuncs = ['divide', 'multiply', 'subtract', 'add'];
const identifierSymbol = {
    'divide': '\u00f7',
    'multiply': '\u00d7',
    'subtract': '\u2212',
    'add': '\u002b',
    'inverse': '1/',
    'squared': 'sqr',
    'sqrt': '\u221a'
}

let prevOper; // prev operator for calcs on currArr
let currArr; // array for calcs
let recordArr; // array of strings to join for display
let displayIsResult;

function resetVars() {
    prevOper = null;
    currArr = [];
    recordArr = [];
    displayIsResult = false;
}

function percent(a, b) {
    return a*b/100;
}

function clearEntry() {
    displayEle.textContent = '0';
}

function clearAll() {
    clearEntry();
    recordEle.textContent = '';
    resetVars();
}

function backspace() {
    if (!displayIsResult) {
        let currText = displayEle.textContent;
        if (currText.length > 1) {
            displayEle.textContent = currText.substring(0, currText.length - 1);
        } else {
            displayEle.textContent = '0';
        }
    }
}

function inverse(a) {
    if(a != 0) {
        return 1/a;
    } else {
        return "Cannot divide by zero";
    }
}

function squared(a) {
    return a*a;
}

function sqrt(a) {
    if (a >= 0) {
        return Math.sqrt(a);
    } else {
        return "Invalid input";
    }
}

function divide(a, b) {
    return a/b;
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

function negative() {
    let currText = displayEle.textContent;
    if (currText[0] === '-') {
        return currText.substring(1, currText.length);
    } else {
        return `-${currText}`;
    }
}

function numberInput(str) {
    if (displayIsResult) {
        clearEntry();
        displayIsResult = !displayIsResult;
    }
    let currText = displayEle.textContent;
    if (currText === '0') {
        if (str !== '.') {
            currText = str;
        }
    } else if (!(currText[currText.length - 1] === '.' && str === '.')) {
        currText += str;
    }
    displayEle.textContent = currText;
}

function operatorInput(identifier) {
    let currText = displayEle.textContent;
    // + - * /
    if (calcOnNextFuncs.includes(identifier)) {
        if (!displayIsResult) {
            currArr.push(Number(currText));
            recordArr.push(Number(currText));
            if (prevOper !== null) {
                let result;
                switch (prevOper) {
                    case 'divide':
                        result = divide(...currArr);
                        break;
                    case 'multiply':
                        result = multiply(...currArr);
                        break;
                    case 'subtract':
                        result = subtract(...currArr);
                        break;
                    case 'add':
                        result = add(...currArr);
                }
                currArr = [result];
                displayEle.textContent = result;
            }
            displayIsResult = !displayIsResult;
        } else {
            recordArr.pop();
        }
        prevOper = identifier;
        recordArr.push(identifierSymbol[identifier]);
    }
    // % 1/ sqr sqrt

    // display record
    displayRecord(recordArr);
}

function displayRecord(arr) {
    recordEle.textContent = arr.join(' ');
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

    const calcEle = document.querySelector('#calculator');
    const histBtn = document.querySelector('#history-btn');
    histBtn.addEventListener('click', () => {
        calcEle.classList.toggle('history');
    })
    
    const histCloseBtn = document.querySelector('#close-history-btn');
    histCloseBtn.addEventListener('click', () => {
        if(calcEle.classList.contains('history')) {
            calcEle.classList.toggle('history');
        }
    })

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

    const negativeBtn = document.querySelector('#negative');
    negativeBtn.addEventListener('click', () => {
        displayEle.textContent = negative(displayEle.textContent);
    })
}

function load() {
    enableButtons();
    resetVars();
}

load();