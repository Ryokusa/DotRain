import { DotGroup } from "../dotObj";
import { Player, ScoreView } from "../gameObj";
import { Stage1 } from "../stage";
import { mainGame } from "../main";
import GameOverScene from "./GameOverScene";
import GameClearScene from "./GameClearScene";

import * as Debug from "../engine/Debug"
import Scene from "../engine/Game/Scene";

//メインシーン
export default class MainScene extends Scene{
    constructor(renderingTarget, stageIndex, titleScene){
        super("メイン", renderingTarget, "rgba(100, 0, 0, 0.25)", "multiply");

        this.dotGroup = new DotGroup(2000);
        this.player = new Player(this.dotGroup, 100, 200, 5);
        this.player.addEventListener("playerDeath", ()=>{this.changeScene(new GameOverScene("game over", mainGame.gameInfo, renderingTarget))}); //TODO:死亡処理
        this.enemyGroup = [];

        this.titleScene = titleScene;

        //スコア
        this.score = 0;

        //ステージ準備
        this.loadStage(stageIndex);
        this.stageIndex = stageIndex;

        console.log(this);

        console.log("mainscene");
    }

    initScene(){
        this.gameObjs.forEach((obj) => {
            obj.init()
        });

        this.score = 0;

        console.log(this);

        console.log("mainscene");
    }

    //ステージ読み込み
    loadStage(stageIndex){
        this.initScene();
        this.gameObjs = [];

        //ステージクラス
        const stage = new Stage1(this.player, this.dotGroup);

        //追加
        stage.gameObjs.forEach((gameObj) => {this.add(gameObj)});

        //this.compile(); //非推奨

        this.add(this.dotGroup);
        this.add(this.player);
        this.enemyGroup = stage.enemyGroup;

        const digitNum = 6;
        this.add(new ScoreView(400 - 10*digitNum-50, 300-10, digitNum));
        console.log("stage loded");
    }

    update(gameInfo, input){
        super.update(gameInfo, input);
        if (input.getKey("r")){this.initScene()};
        if (input.getKey("m")){this.changeScene(this.titleScene)}

        //敵死亡時
        if (this.enemyGroup.isDeadAll()){
            this.changeScene(new GameClearScene("gameclear", gameInfo, this.renderingTarget));
        }

        Debug.addText(["score", this.score]);
    }
}