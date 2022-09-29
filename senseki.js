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

class BattleLogButton {
    constructor(baseElement, viewer) {
        this._baseElement = baseElement;
        this._viewer = viewer;
    }

    show() {
        if (this._elem) {
            return;
        }

        const elem = document.createElement('button');
        elem.style.zIndex = 1000;
        elem.style.position = 'absolute';
        elem.onclick = () => this._click();
        elem.innerText = '戦績';
        this._baseElement.append(elem);
    }

    _click() {
        this._viewer.show();
    }
}

class BattleLogViewer {
    constructor(baseElement, repository) {
        this._baseElement = baseElement;
        this._repository = repository;
    }

    show() {
        if (this._elem) {
            return;
        }

        const elem = document.createElement('div');
        this._elem = elem;

        elem.style.zIndex = 1000;
        elem.style.position = 'absolute';
        elem.style.backgroundColor = 'white';

        const title = document.createElement('div');
        title.innerHTML = '<h2>戦績</h2>';
        elem.append(title);

        const summary = this._repository.getCount();
        const summaryView = document.createElement('div');
        summaryView.innerHTML = `<b>累計戦績: ${summary.win}勝 ${summary.lose}敗</b>`;
        elem.append(summaryView);
        
        const logs = this._repository.getLogs();
        for (const log of logs) {
            const logView = document.createElement('div');
            logView.innerText = `${new Date(log.date).toLocaleString()}: ${log.result}`;
            elem.append(logView);
        }

        const closeButton = document.createElement('button');
        closeButton.innerText = '閉じる';
        closeButton.onclick = () => this.hide();
        elem.append(closeButton);

        this._baseElement.append(elem);
    }

    hide() {
        this._elem.remove();
        this._elem = null;
    }
}

class BattleLogRepository {
    static COUNT_KEY = 'BattleLogCount';
    static LOG_KEY = 'BattleLogLogs';

    getCount() {
        const value = localStorage.getItem(BattleLogRepository.COUNT_KEY);
        if (value == null) {
            return { total: 0, win: 0, lose: 0 };
        }
        return JSON.parse(value);
    }

    getLogs() {
        const value = localStorage.getItem(BattleLogRepository.LOG_KEY);
        if (value == null) {
            return [];
        }
        return JSON.parse(value);
    }


    win() {
        const curr = this.getCount();
        curr.total++;
        curr.win++;
        localStorage.setItem(BattleLogRepository.COUNT_KEY, JSON.stringify(curr));

        let logs = this.getLogs();
        logs.unshift({ date: (new Date()).toISOString(), result: 'win' });
        logs = logs.slice(0, 20);
        localStorage.setItem(BattleLogRepository.LOG_KEY, JSON.stringify(logs));
    }

    lose() {
        const curr = this.getCount();
        curr.total++;
        curr.lose++;
        localStorage.setItem(BattleLogRepository.COUNT_KEY, JSON.stringify(curr));

        let logs = this.getLogs();
        logs.unshift({ date: (new Date()).toISOString(), result: 'lose' });
        logs = logs.slice(0, 20);
        localStorage.setItem(BattleLogRepository.LOG_KEY, JSON.stringify(logs));
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

    getWinnerName() {
        const xpath = '//*[@id="main"]/div/div[3]/div[3]/div[3]/div[2]/div/span';
        const elems = this._browserAdapter.getElementsByXPath(xpath);

        if (elems.length === 0) {
            return null;
        }

        return elems[0].innerHTML;
    }

    /**
     * ゲームの状態を取得する
     * @returns {string} 'PLAYING' (プレー中 ロビー含む), 'FINISHED'（終了）
     */
    getGameStatus() {
        const xpath = '//*[@id="main"]/div/div[3]/div[3]/div[3]/div[1]/span';
        const elems = this._browserAdapter.getElementsByXPath(xpath);

        if (elems.length === 0) {
            return 'PLAYING';
        }

        if (elems[0].innerHTML === '勝利') {
            return 'FINISHED';
        }

        return 'UNKNOWN';
    }

    /**
     * プレーヤー名を取得する
     */
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
    const repo = new BattleLogRepository();
    const viewer = new BattleLogViewer(document.getElementById('main'), repo);
    const button = new BattleLogButton(document.getElementById('container'), viewer);
    button.show();

    const watcher = new GameWatcher(new BrowserAdapter());
    watcher.setHook();

    let prevState = watcher.getGameStatus();
    setInterval(() => {
        if (watcher.getGameMode() === 'HIDDEN') {
            const currState = watcher.getGameStatus();
            if (prevState !== 'FINISHED' && currState === 'FINISHED') {
                const winnerName = watcher.getWinnerName();
                const playerName = watcher.getPlayerName();
                if (winnerName === playerName) {
                    repo.win();
                } else {
                    repo.lose();
                }
            }
            prevState = watcher.getGameStatus();
        }
    }, 100);
}
