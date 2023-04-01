import { assets } from "./engine/engine";
import Rectangle from "./engine/Rectangle";
import Sprite from "./engine/Sprite";
import GameEvent from "./engine/Game/GameEvent";
import GameObject from "./engine/Game/GameObject";
import SpriteObject from "./engine/Game/GameObject/SpriteObject";
import Scene from "./engine/Game/Scene";
import { Menu, MenuItem } from "./gameObj";
import MainScene from "./Scenes/MainScene";

//タイトルシーン
class Title extends SpriteObject{
    constructor(){
        const img = new Sprite(assets.get("menu"), new Rectangle(0, 0, 400, 300));
        super(0, 0, img);
    }
}

//タイトルメニュー
class TitleMenu extends Menu{
    constructor(x, y, blockW, blockH){
        const items = []
        items.push(new MenuItem("Start"));
        items.push(new MenuItem("HowToPlay"));
        super(x, y, items);
        this.blockW = blockW;
        this.blockH = blockH;
    }

    selectorRender(canvas, selX, selY){
        super.selectorRender(canvas, selX, selY);
        const context = canvas.getContext("2d");
        context.fillStyle = "#9999FF";
        context.strokeStyle = "#FFFFFF";

        context.fillRect(selX, selY, this.blockW, this.blockH);
        context.strokeRect(selX, selY, this.blockW, this.blockH);
    }

    //選択処理
    update(gameInfo, input){
        super.update(gameInfo, input);
        if (input.getKeyDown(" ")){
            this.dispatchEvent("decidemenu", new GameEvent(this.items[this.index]))
        }
    }
}

//ハウトゥーボード
class HowTo extends GameObject{
    constructor(){
        super(25, 25, 350, 250);
        this.txts = []; //説明書
        /*
        予定
        スペースキー：吸収(エネルギー消費)
        zキー長押し：ため
        cキー：タレット発射＆設置
        */
        this.font="20px sans-serif"
        this.color="#9999FF"
        this.fontOffsetX = 20;
        this.fontOffsetY = 20;

        this.pageIndex = 0;
        this.pageNum = 0;
        this.loadPages();
    }

    //ページ読み込み
    loadPages(){
        this.txts[0] = "遊び方\n" +
                    "十字キー\t: 移動\n" +
                    "zキー\t: 通常弾\n" +
                    "xキー\t: 爆発弾\n" +
                    "rキー\t: リセット\n";
        this.txts[1] = "次のページテスト";
        this.pageNum = 2;
    }

    //ページ変更
    changePage(index){
        this.pageIndex = index
    }

    //次のページ (成功時true)
    nextPage(){
        if(this.pageIndex == this.pageNum-1){
            return false;
        }
        this.pageIndex++;
        return true;
    }

    //前のページ
    prevPage(){
        if(this.pageIndex == 0){
            return false;
        }
        this.pageIndex--;
        return true;
    }

    render(canvas){
        const context = canvas.getContext("2d");
        context.fillStyle = "#000099";
        context.fillRect(this.x, this.y, this.w, this.h);

        context.font = this.font;
        context.fillStyle = this.color;
        context.textAlign = "left";
        context.textBaseline = "top";
        const fontSize = 20;
        const lineHeight = 1.1;
        // 1行ずつ描画
        for( let lines=this.txts[this.pageIndex].split( "\n" ), i=0, l=lines.length; l>i; i++ ) {
            let line = lines[i] ;
            let addY = 0 ;

            // 2行目以降の水平位置は行数とlineHeightを考慮する
            if ( i ) addY += fontSize * lineHeight * i ;

            context.fillText( line, this.x + this.fontOffsetX, this.y + addY + this.fontOffsetY ) ;
        }
        super.render(canvas);
    }

    update(gameInfo, input){
        //次のページ
        if (input.getKeyDown(" ") || input.getKeyDown("ArrowRight")){
            if (!this.nextPage()){  //終了時
                this.close();
            }
        }
        if (input.getKeyDown("ArrowLeft")){
            if (!this.prevPage()){
                this.close();
            }
        }
    }

    close(){
        this.pageIndex = 0;
        this.dispatchEvent("close", new GameEvent(this));
    }
}

export class TitleScene extends Scene {
    constructor(renderingTarget, backgroundColor = "#000000") {
        super("タイトル", renderingTarget, backgroundColor);
        this.title = new Title();
        this.titleMenu = new TitleMenu(50, 150, 15, 15)
        this.titleMenu.addEventListener("decidemenu", (e) => this.decideMenu(e.target));
        this.howTo = new HowTo();
        this.howTo.enable = false;
        this.add(this.title);
        this.add(this.titleMenu);
        this.overlayObj = false;

        this.mainScene = new MainScene(this.renderingTarget, 1, this);  //メモリの関係上
    }

    update(gameInfo, input){
        //オーバーレイ処理
        if(!this.onOverlay){
            super.update(gameInfo, input);
        }else{
            this.overlayObj.update(gameInfo, input);
            if(this.onOverlay) this.overlayObj.render(this.renderingTarget);
        }
    }

    decideMenu(menuItem){
        const text = menuItem.text;
        console.log("sel:" + text);
        if (text == "Start"){
            this.changeScene(this.mainScene);
        }else if(text == "HowToPlay"){
            this.showOverlay(this.howTo)
        }
    }

    changeScene(newScene){
        this.mainScene.initScene();
        super.changeScene(newScene);
    }

    showOverlay(obj){
        this.onOverlay = true;
        this.overlayObj = obj; 
        this.overlayObj.addEventListener("close", (e) => this.closeOverlay());
    }

    closeOverlay(){
        this.overlayObj.removeEventListener("close");
        this.onOverlay = false;
    }
}
