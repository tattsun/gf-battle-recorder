var playerName = '';

function getElementCountByXPath(xpath) {
    const res = document.evaluate(`count(${xpath})`, document, null, XPathResult.ANY_TYPE, null);
    console.log(xpath, res);
    return res.numberValue;
}

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
    return getElementCountByXPath(`//span[text()='勝利']`) > 0;
}

function getIsWin() {
    return getElementCountByXPath(`//span[text()='${playerName}']`) > 3;
}

setGetNameHook();

setInterval(() => {
    console.log(playerName);
    if (getIsGameDone()) {
        console.log(`戦闘終了: ${getIsWin()}`);
    } else {
        console.log("戦闘未終了");
    }
    
}, 1000);