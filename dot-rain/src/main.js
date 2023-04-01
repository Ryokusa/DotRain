import { assets } from "./engine/engine";
import * as Debug from "./engine/Debug";
import Game from "./engine/Game";

import { StageInfo } from "./stage";
import { TitleScene } from "./title";

class MainGame extends Game{
    constructor(){
        super("ドットレイン", 400, 300, 60, 1.5);
        this.gameInfo.stageInfo = new StageInfo(0, 0.1, 0.9);
        const titleScene = new TitleScene(this.screenCanvas);
        this.changeScene(titleScene);
        console.log("titlescene");
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
