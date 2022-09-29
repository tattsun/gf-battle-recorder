const { GameWatcher, BrowserAdapter } = require('./senseki');

class BrowserAdapterMock {
    constructor() {
        this._xpathMocks = {};
    }

    registerMockByXPath(xpath, elem) {
        let elems = this._xpathMocks[xpath];
        if (!elems) {
            elems = [];
            this._xpathMocks[xpath] = elems;
        }
        elems.push(elem);
    }

    getElementsByXPath(xpath) {
        return this._xpathMocks[xpath] || [];
    }
}

describe('GameWatcher', () => {
    const nameInputXPath = '//*[@id="main"]/div/div[3]/div[6]/input';
    const winXPath = '//*[@id="main"]/div/div[3]/div[3]/div[3]/div[1]/span';

    let adapter;
    let watcher;

    beforeEach(() => {
        adapter = new BrowserAdapterMock();
        watcher = new GameWatcher(adapter);
    });

    function newMockElementHasValue(value) {
        const eventListeners = [];

        return {
            value,
            addEventListener: (_, listener) => eventListeners.push(listener),
            dispatch: (newValue) => eventListeners.forEach((listener) => listener({
                target: {
                    value: newValue,
                },
            })),
        };
    }

    function newMockElementHasInnerHTML(innerHTML) {
        return {
            innerHTML,
        };
    }

    describe('getPlayerName()', () => {
        it('returns empty string when not initialized', () => {
            expect(watcher.getPlayerName()).toEqual('');
        });

        it('can get the default player name', () => {
            adapter.registerMockByXPath(nameInputXPath, newMockElementHasValue('some player'));
            watcher.setHook();
            
            expect(watcher.getPlayerName()).toEqual('some player');
        });

        it('can get the another default player name', () => {
            adapter.registerMockByXPath(nameInputXPath, newMockElementHasValue('another player'));
            watcher.setHook();

            expect(watcher.getPlayerName()).toEqual('another player');
        });

        it('can detect value change', () => {
            const elem = newMockElementHasValue('initial name');
            adapter.registerMockByXPath(nameInputXPath, elem);
            watcher.setHook();

            expect(watcher.getPlayerName()).toEqual('initial name');

            elem.dispatch('new name');
            expect(watcher.getPlayerName()).toEqual('new name');
        });

        it('throws error when elem not found', () => {
            expect(() => {
                watcher.setHook();
            }).toThrow();
        });

        it('throws error when too many elems', () => {
            adapter.registerMockByXPath(nameInputXPath, newMockElementHasValue('hoge'));
            adapter.registerMockByXPath(nameInputXPath, newMockElementHasValue('fuga'));
            expect(() => {
                watcher.setHook();
            }).toThrow();
        });
    });

    describe('getGameMode()', () => {
        const gameModeXPath = '//*[@id="main"]/div/div[1]/span';

        beforeEach(() => {
            adapter.registerMockByXPath(nameInputXPath, newMockElementHasValue('hoge'));
        });

        it('returns UNKNOWN on a unknown game', () => {
            expect(watcher.getGameMode()).toEqual('UNKNOWN');
        });

        it('returns UNKNOWN on a 真剣タイマン', () => {
            adapter.registerMockByXPath(gameModeXPath, newMockElementHasInnerHTML('真剣タイマン'));
            expect(watcher.getGameMode()).toEqual('UNKNOWN');
        });

        it('returns HIDDEN on a 隠れ乱闘', () => {
            adapter.registerMockByXPath(gameModeXPath, newMockElementHasInnerHTML('隠れ乱闘'));
            expect(watcher.getGameMode()).toEqual('HIDDEN');
        });
    });

    describe('getGameStatus()', () => {
        it('returns PLAYING on playing', () => {
            expect(watcher.getGameStatus()).toEqual('PLAYING');
        });

        it('returns FINISHED on game finished', () => {
            adapter.registerMockByXPath(winXPath, newMockElementHasInnerHTML('勝利'));
            expect(watcher.getGameStatus()).toEqual('FINISHED');
        });

        it('throws error when unknown element is found', () => {
            adapter.registerMockByXPath(winXPath, newMockElementHasInnerHTML('aaa'));
            expect(watcher.getGameStatus()).toEqual('UNKNOWN');
        });
    });
});