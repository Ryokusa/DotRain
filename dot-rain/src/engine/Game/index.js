import GameInfo from "./GameInfo";
import InputReceiver from "../Input/InputReceiver";
import * as Debug from "../Debug"

//ゲームクラス
//TODO: コンストラクタにシーンを指定で初期画面設定を可能に
export default class Game{
    constructor(title, width, height, maxFps, scale = 1){
        this.gameInfo = new GameInfo(title, width, height, maxFps, 0)

        this.screenCanvas = document.createElement("canvas");
        this.screenCanvas.width = width * scale;
        this.screenCanvas.height = height * scale;
        const context = this.screenCanvas.getContext("2d");
        context.scale(scale, scale);

        this._inputReceiver = new InputReceiver(this.screenCanvas);
        this._prevTimestamp = 0;

        this.currentScene = undefined;

        this.debug = true;  //デバッグフラグ

        //アクティブ時のみ稼働
        this.pause = false;
        window.addEventListener("blur", this.onBlur);
        window.addEventListener("focus", this.onFocus);
        
        //スクロールキーはすべて無効
        window.addEventListener("keydown", (e) => {
            let code = e.code;
            switch(code) {
                case "ArrowLeft":
                case "ArrowUp":
                case "ArrowRight":
                case "ArrowDown": 
                case "Space":
                e.preventDefault();
            } 
        }, true);
    }

    changeScene(newScene, args = {}){
        newScene.setArgs(args);
        this.currentScene = newScene;
        this.currentScene.removeEventListener("changescene");
        this.currentScene.addEventListener("changescene", (e) =>
             this.changeScene(e.target));
    }

    //elementタグに追加する形でスタート
    start(element){
        requestAnimationFrame(this._loop.bind(this));
        element.appendChild(this.screenCanvas);
    }

    //メインループ
    _loop(timestamp){
        const elapsedSec = timestamp - this._prevTimestamp;
        if(!this.pause){
            this.gameInfo.currentFps = 1000 / elapsedSec;
            Debug.addText(["FPS", this.gameInfo.currentFps.toFixed()]);
            //this.gameInfo.currentFps = 75;
            this.gameInfo.timeCount += 1;

            //インプット
            const input = this._inputReceiver.getInput();
            
            this.currentScene.update(this.gameInfo, input);

            //デバッグ用
            if (this.debug) Debug.render();
        }

        this._prevTimestamp = timestamp;
        requestAnimationFrame(this._loop.bind(this));
    }

    //フォーカズ時
    onFocus(){
        this.pause = false;
    }

    //フォーカスが離れた時
    onBlur(){
        this.pause = true;
    }
}