import Scene from "../engine/Game/Scene";
import { TextObj } from "../gameObj";
import { TitleScene } from "../title";

//ゲームオーバークラス
//引数: なし
export default class GameOverScene extends Scene{
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