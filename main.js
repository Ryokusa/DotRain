"use strict";

//メインシーン
class MainScene extends Scene{
    constructor(renderingTarget, stageIndex, titleScene){
        super("メイン", renderingTarget, "rgba(100, 0, 0, 0.25)", "multiply");

        this.dotGroup = new DotGroup(2000);
        this.player = new Player(this.dotGroup, 100, 200, 5);
        this.enemyGroup = [];

        this.titleScene = titleScene;

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

        console.log(this);

        console.log("mainscene");
    }

    //ステージ読み込み
    loadStage(stageIndex){
        this.initScene();
        this.gameObjs = [];

        //ステージクラス
        const c = Utils.getClass("Stage"+stageIndex);
        const stage = new c(this.player, this.dotGroup);

        //追加
        stage.gameObjs.forEach((gameObj) => {this.add(gameObj)});

        //this.compile(); //非推奨

        this.add(this.dotGroup);
        this.add(this.player);
        this.enemyGroup = stage.enemyGroup;
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
    }

    
}


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
class GameOverScene extends Scene{
    constructor(name, gameInfo, renderingTarget){
        super(name, renderingTarget, "#000000");
        const centerPos = gameInfo.getCenterPos();
        this.add(new TextObj("GAME OVER", centerPos.x, centerPos.y, "center", "#FFFFFF", 30));
    }
}

class GameClearScene extends Scene{
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
for (let i = 0; i < 9; i++){
    assets.addImage("s"+i, "img/number/" + i + "s.png")
}
assets.loadAll().then((a) => {
    const mainGame = new MainGame();
    mainGame.start(document.getElementById("game"));
    console.log("loaded");
})
