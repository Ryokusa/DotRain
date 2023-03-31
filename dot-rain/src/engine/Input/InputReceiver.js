import MouseInput from "../MouseInput";
import Input from ".";

//入力受け取りクラス
export default class InputReceiver {
    constructor(el) {
        this._keyMap = new Map();
        this._prevKeyMap = new Map();
        this._mouse = new MouseInput();

        addEventListener('keydown', (ke) => this._keyMap.set(ke.key, true));
        addEventListener('keyup', (ke) => this._keyMap.set(ke.key, false));
        el.addEventListener("mousemove", (me) => {
            this._mouse.x = me.offsetX;
            this._mouse.y = me.offsetY;
        });
        el.addEventListener("mousedown", (me) => this._mouse.down = true);
        el.addEventListener("mouseup", (me) => this._mouse.down = false);
        el.addEventListener("touchmove", (te) => {
            te.preventDefault()
            const _elRect = el.getBoundingClientRect();
            this._mouse.x = te.changedTouches[0].clientX - _elRect.left - window.pageXOffset;
            this._mouse.y = te.changedTouches[0].clientY - _elRect.top - window.pageYOffset;
            Debug.addText([["touchmove", true]]);
        })
        el.addEventListener("touchstart", (te) => this._mouse.down = true);
        el.addEventListener("touchend", (te) => this._mouse.down = false);
    }

    getInput() {
        const keyMap = new Map(this._keyMap);
        const prevKeyMap = new Map(this._prevKeyMap);
        this._prevKeyMap = new Map(this._keyMap);
        return new Input(keyMap, prevKeyMap, this._mouse);
    }
}