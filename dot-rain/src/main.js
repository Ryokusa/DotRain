import { assets } from "./engine/engine";
import * as Debug from "./engine/Debug";
import Scene from "./engine/Game/Scene";
import Game from "./engine/Game";
import { StageInfo } from "./stage";
import { TitleScene } from "./title";
import { TextObj } from "./gameObj";

class MainGame extends Game{
    constructor(){
        super("ドットレイン", 400, 300, 60, 1.5);
        this.gameInfo.stageInfo = new StageInfo(0, 0.1, 0.9);
        const titleScene = new TitleScene(this.screenCanvas);
        this.changeScene(titleScene);
        console.log("titlescene");
    }
}

//ゲームオーバークラス
//引数: なし
export class GameOverScene extends Scene{
    constructor(name, gameInfo, renderingTarget){
        super(name, renderingTarget, "#000000");
        const centerPos = gameInfo.getCenterPos();
        this.add(new TextObj("GAME OVER", centerPos.x, centerPos.y, "center", "#FFFFFF", 30));
    }

    update(stageInfo, input){
        super.update(stageInfo,input)
        if (input.getKeyDown(" ")) this.changeScene(new TitleScene(this.renderingTarget));
    }
}

export class GameClearScene extends Scene{
    constructor(name, gameInfo, renderingTarget){
        super(name, renderingTarget, "#000000");
        const centerPos = gameInfo.getCenterPos();
        this.add(new TextObj("GAME CLEAR", centerPos.x, centerPos.y, "center", "#FFFFFF", 30));
    }

    update(stageInfo, input){
        super.update(stageInfo,input)
        if (input.getKeyDown(" ")) this.changeScene(new TitleScene(this.renderingTarget));
    }
}

//ゲーム開始
Debug.setDebugElement(document.getElementById("debug"));
//アセットダウンロード
assets.addImage("menu", "img/menu.png");
assets.addImage("player", "img/p.png");
assets.addImage("score", "img/SCOREs.png");
for (let i = 0; i < 10; i++){
    assets.addImage("s"+i, "img/number/" + i + "s.png")
}

export let mainGame = null;
assets.loadAll().then((a) => {
    mainGame = new MainGame();
    mainGame.start(document.getElementById("game"));
    console.log("loaded");
})
