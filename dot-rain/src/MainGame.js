import Game from "./engine/Game";

import { StageInfo } from "./stage";
import { TitleScene } from "./title";

export default class MainGame extends Game{
    constructor(){
        super("ドットレイン", 400, 300, 60, 1.5);
        this.gameInfo.stageInfo = new StageInfo(0, 0.1, 0.9);
        const titleScene = new TitleScene(this.screenCanvas);
        this.changeScene(titleScene);
        console.log("titlescene");
    }
}