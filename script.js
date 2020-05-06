const calcEle = document.querySelector('#calculator');
const histBtn = document.querySelector('#history-btn');
const histCloseBtn = document.querySelector('#close-history-btn');

histBtn.addEventListener('click', () => {
    calcEle.classList.toggle('history');
})

histCloseBtn.addEventListener('click', () => {
    if(calcEle.classList.contains('history')) {
        calcEle.classList.toggle('history');
    }
})