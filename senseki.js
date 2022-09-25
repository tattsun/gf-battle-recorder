class BrowserAdapter {
    getElementsByXPath(xpath) {
        const res = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        let curr = res.iterateNext();
        const elems = [];
        while (curr) {
            elems.push(curr);
            curr = res.iterateNext();
        }
        return elems;
    }
}

class GameWatcher {
    constructor(browserAdapter) {
        this._browserAdapter = browserAdapter;
        this._playerName = '';
    }

    setHook() {
        const xpath = '//*[@id="main"]/div/div[3]/div[6]/input';
        const elems = this._browserAdapter.getElementsByXPath(xpath);
        if (elems.length !== 1) {
            throw new Error(`invalid elem count: ${elems}`);
        }
        this._playerName = elems[0].value;
        elems[0].addEventListener('change', (ev) => {
            this._playerName = ev.target.value;
        });
    }

    getPlayerName() {
        return this._playerName;
    }

    /**
     * 現状のゲームモードを特定する
     * @returns {string} 'HIDDEN' (隠れ乱闘), 'UNKNOWN' (未対応)
     */
    getGameMode() {
        const xpath = '//*[@id="main"]/div/div[1]/span';
        const elems = this._browserAdapter.getElementsByXPath(xpath);

        if (elems.length !== 1) {
            return 'UNKNOWN';
        }

        switch (elems[0].innerHTML) {
            case '隠れ乱闘':
                return 'HIDDEN';
            default:
                return 'UNKNOWN';
        }
    }
}

if (typeof window === 'undefined') {
    module.exports = {
        GameWatcher,
        BrowserAdapter,
    };
} else {
    const watcher = new GameWatcher(new BrowserAdapter());
    watcher.setHook();

    setInterval(() => {
        console.log(`Player name: ${watcher.getPlayerName()}`);
    }, 1000);
}

// class HiddenMelee {
//     constructor() {
//     }
// }

// function getElementCountByXPath(xpath) {
//     const res = document.evaluate(`count(${xpath})`, document, null, XPathResult.ANY_TYPE, null);
//     console.log(xpath, res);
//     return res.numberValue;
// }

// function getIsGameDone() {
//     return getElementCountByXPath(`//span[text()='勝利']`) > 0;
// }

// function getIsWin() {
//     return getElementCountByXPath(`//span[text()='${playerName}']`) > 3;
// }


// setInterval(() => {
//     console.log(playerName);
//     if (getIsGameDone()) {
//         console.log(`戦闘終了: ${getIsWin()}`);
//     } else {
//         console.log("戦闘未終了");
//     }
    
// }, 1000);

