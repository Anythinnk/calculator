// to-do
// clean up operatorInput, spread into eval and others to make doing up equals function easier
// equals function to add to history
// clicking on history records brings over record to calculator
// button to clear history
// resize font size dynamically
const calcEle = document.querySelector('#calculator');
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
let immStr; // string containing numbers with immediate calcs done on them e.g. 'sqr(9)' for 9 squared, needed as immediate calcs are not confirmed to be used until a calcOnNextFunc function is done
let recordArr; // array of strings to join for display
let displayIsResult;

function resetVars() {
    prevOper = null;
    currArr = [];
    immStr = null;
    recordArr = [];
    displayIsResult = false;
}

function percent(a, b) {
    return a*b/100;
}

function clearEntry() {
    if (calcEle.classList.contains('only-numbers')) {
        clearAll();
    }
    displayEle.textContent = '0';
    if (immStr !== null) {
        immStr = null;
        displayRecord(recordArr);
    }
}

function clearAll() {
    if (calcEle.classList.contains('only-numbers')) { 
        enableOperators();
    }
    clearEntry();
    recordEle.textContent = '';
    resetVars();
}

function backspace() {
    if (calcEle.classList.contains('only-numbers')) {
        clearAll();
    } else if (!displayIsResult) {
        let currText = displayEle.textContent;
        if (currText.length > 1) {
            displayEle.textContent = currText.substring(0, currText.length - 1);
        } else {
            displayEle.textContent = '0';
        }
    }
}

function inverse(a) {
    return divide(1, a);
}

function squared(a) {
    return a*a;
}

function sqrt(a) {
    if (a >= 0) {
        return Math.sqrt(a);
    } else {
        disableOperators();
        return "Invalid input";
    }
}

function divide(a, b) {
    if (b != 0) {
        return a/b;
    } else {
        disableOperators();
        return "Cannot divide by zero";
    }
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

function equals() {
    if (calcEle.classList.contains('only-numbers')) {
        clearAll();
    }
}

function numberInput(str) {
    if (calcEle.classList.contains('only-numbers')) {
        clearAll();
    } else if (displayIsResult) {
        clearEntry();
        displayIsResult = false;
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

function operatorInput(identifier) {
    let currText = displayEle.textContent;

    if (calcOnNextFuncs.includes(identifier)) {
        if (!displayIsResult || immStr !== null) {
            currArr.push(Number(currText));
            recordArr.push((immStr !== null) ? immStr : Number(currText));
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
            displayIsResult = true;
        } else {
            recordArr.pop();
        }
        prevOper = identifier;
        immStr = null;
        recordArr.push(identifierSymbol[identifier]);
        displayRecord(recordArr);
    } else if (immediateFuncs.includes(identifier)) {
        let result;
        let num = Number(currText);
        switch (identifier) {
            case 'percent':
                result = (currArr.length === 0) ? 0 : percent(currArr[0], num);
                break;
            case 'inverse':
                result = inverse(num);
                break;
            case 'squared':
                result = squared(num);
                break;
            case 'sqrt':
                result = sqrt(num);
        }

        if (identifier === 'percent') {
            immStr = result;
        } else {
            immStr = (immStr === null) ? `${identifierSymbol[identifier]}(${currText})`: `${identifierSymbol[identifier]}(${immStr})`;
        }
        
        displayEle.textContent = result;
        displayIsResult = true;

        let tempArr = Array.from(recordArr);
        tempArr.push(immStr);
        displayRecord(tempArr);
    }
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

    const equalsBtn = document.querySelector('#equals');
    equalsBtn.addEventListener('click', () => equals());
}

function disableOperators() {
    calcEle.classList.toggle('only-numbers');
    const operatorBtns = document.querySelectorAll('.operator');
    operatorBtns.forEach(btn => {
        if (btn.id !== 'equals') {
            btn.disabled = true;
        }
    });

    const negativeBtn = document.querySelector('#negative');
    negativeBtn.disabled = true;

    const decimalBtn = document.querySelector('#decimal');
    decimalBtn.disabled = true;
}

function enableOperators() {
    calcEle.classList.toggle('only-numbers');
    const operatorBtns = document.querySelectorAll('.operator');
    operatorBtns.forEach(btn => btn.disabled = false);

    const negativeBtn = document.querySelector('#negative');
    negativeBtn.disabled = false;

    const decimalBtn = document.querySelector('#decimal');
    decimalBtn.disabled = false;
}

function load() {
    enableButtons();
    resetVars();
}

load();