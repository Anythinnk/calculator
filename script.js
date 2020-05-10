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
}

function load() {
    enableButtons();
}

load();