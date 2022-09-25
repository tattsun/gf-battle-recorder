var playerName = '';

function setGetNameHook() {
    const query = "#main > div > div:nth-child(3) > div:nth-child(6) > input[type=text]";
    const elem = document.querySelector(query);
    if (!elem) {
        return;
    }
    playerName = elem.value;
    elem.addEventListener('change', (event) => {
        playerName = event.target.value;
    });
}

function getIsGameDone() {
    const query = '#main > div > div:nth-child(3) > div:nth-child(2) > div:nth-child(3) > div:nth-child(1) > span';
    const elem = document.querySelector(query);
    return elem != null;
}

function clickShowRatingButton() {
    const query = "#main > div > div:nth-child(3) > div:nth-child(2) > div:nth-child(8)";
    const elem = document.querySelector(query);
    if (elem) {
        elem.click();
    }
}

function getWinnerName() {
    const query = "#main > div > div:nth-child(3) > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > div > span";
    const elem = document.querySelector(query);
    return elem.innerHTML;
}

setGetNameHook();

setInterval(() => {
    console.log(playerName);
    if (getIsGameDone()) {
        console.log(`戦闘終了: 勝者 ${getWinnerName()}`);
    } else {
        console.log("戦闘未終了");
    }
    
}, 1000);