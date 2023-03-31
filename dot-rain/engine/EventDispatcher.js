//イベントディスパッチャー
export default class EventDispatcher {
    constructor(){
        this._eventListeners = {}
    }

    addEventListener(type, callback) {
        if (this._eventListeners[type] == undefined){
            this._eventListeners[type] = [];
        }
        this._eventListeners[type].push(callback);
    }

    dispatchEvent(type, event) {
        const listeners = this._eventListeners[type];
        if(listeners != undefined) listeners.forEach(callback => callback(event));
    }

    removeEventListener(type){
        this._eventListeners[type] = undefined;
    }
}