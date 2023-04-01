import Scene from "../engine/Game/Scene";
import { TextObj } from "../gameObj";
import { TitleScene } from "../title";

export default class GameClearScene extends Scene{
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