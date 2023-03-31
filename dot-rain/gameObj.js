import { GameObject, SpriteObject, Sprite, assets, Rectangle, Debug, Utils, GameEvent } from "./engine";
import { Tag } from "./tag";
import { Animator, LinearAnimation } from "./animation";
import { mainGame } from "./main";
import { DotObj } from "./dotObj";

/*** メニュー系 ***/

//メニューアイテム
export class MenuItem extends GameObject{
    constructor(text, type="text",font="20px sans-serif", color="#FFFFFF"){
        super(0, 0, 0, 0);
        this.text = text;
        this.type = type;
        this.font = font;
        this.color = color;
    }
    
    render(canvas){
        super.render(canvas);
        const context = canvas.getContext("2d");
        context.font = this.font;
        context.fillStyle = this.color;
        context.textAlign = "left";
        context.textBaseline = "top";
        context.fillText(this.text, this.x, this.y);
    }

    //タイプは操作型orテキストの２つを用意する
}

//メニューオブジェ
export class Menu extends GameObject{
    constructor(x, y, items = [], selectorX = -20, textHeight = 20){
        super(x, y, 0, 0);
        items.forEach((item) => this.addChild(item));
        this.items = items;
        this.index = 0;
        this.itemNum = items.length;
        this.selectorX = selectorX;
        this.textHeight = textHeight;

        //アイテム位置
        for (let i = 0; i < this.itemNum; i++){
            this.childs[i].y = this.y + i * this.textHeight;
        }
    }

    //セレクター画像を描画(オーバーライドで)
    selectorRender(canvas, selX, selY){}

    //アイテムレンダー
    render(canvas){
        super.render(canvas);
        this.selectorRender(canvas, this.selectorX + this.x, this.index*this.textHeight + this.y)
    }

    //メニュー操作
    update(gameInfo, input){
        if (input.getKeyDown("ArrowUp")) this.index = (this.index+this.itemNum + 1) % this.itemNum;
        if (input.getKeyDown("ArrowDown")) this.index = (this.index+this.itemNum - 1) % this.itemNum;
        this.childs[this.index].update(gameInfo, input);
    }

    getText(index){
        return this.childs[index].text;
    }
}

//テキストオブジェ
//とりあえず表示機能だけ
//引数pos {type:座標指定("pos")かどうか, x: y: 座標}
export class TextObj extends GameObject{
    constructor(text, x, y, align = "left", color = "#FFFFFF", size = 20, font="sans-serif"){
        super(x,y,0,0);
        this.text = text;
        this.fontName = size+ " " + font;
        this.color = color;
        this.align = align;
    }

    render(canvas){
        super.render(canvas);   //いる？＞？？？？
        const context = canvas.getContext("2d");
        context.font = this.fontName;
        context.fillStyle = this.color;
        context.textAlign = this.align;
        context.textBaseline = "top";
        context.fillText(this.text, this.x, this.y);
    }
}

/***  ゲーム内オブジェ系 ***/

//プレイヤー
export class Player extends SpriteObject{
    constructor(dotGroup, x, y, hp, shotInterval = 5, speed = 3.0, pointRadian = 20, hitTags = [Tag.enemy, Tag.enemy_bullet]){
        const img = new Sprite(assets.get("player"), new Rectangle(0, 0, 15, 15));
        super(x, y, img);
        //初期値保存
        this._cx = x;
        this._cy = y;
        this._chp = hp;
        this._cshotInterval;

        this.dotGroup = dotGroup;
        this.hp = hp;
        this.shotInterval = shotInterval;
        this._shotIntervalCount = this.shotInterval;
        this.speed = speed;
        this.hitTags = hitTags;

        this.muteki = false;    //無敵
        this.controlable = true;    //操作可能
        this.absorbable = true;     //吸収可能

        this.tulletNum = 1;
        this.tulletF = true;

        this.setDamageAnim();
        
        //ポイント吸収用オブジェ
        const centerPos = this.getCenterPos();
        const size = pointRadian * 2;
        const circle = new GameObject(centerPos.x - this.x - pointRadian, centerPos.y - this.y - pointRadian, size, size, [Tag.point_circle]);
        this.addChild(circle);
        console.log(circle);

        this.originTags.push(Tag.player);
    }

    hitable(){
        return (this.damageCount == this.damageCountT) || this.damageCount == 0;
    }

    init(){
        this.dMove = 0;
        this.px = this._cx;
        this.py = this._cy;
        this.x = this._cx;
        this.y = this._cy;
        this.hp = this._chp;
        this._shotIntervalCount = this.shotInterval;
        this.muteki = false;    //無敵
        this.controlable = true;    //操作可能
        this.absorbable = true;     //吸収可能
        this._damageAnim.reset();
        this.visible = true;
        this.enable = true;
        this.tulletNum = 1;     //持ちタレット数
        this.tulletF = true;    //タレット発射可能フラグ
    }

    render(canvas){
        super.render(canvas);
    }

    update(gameInfo, input){
        //クール時間
        if (this._shotIntervalCount < this.shotInterval) this._shotIntervalCount += gameInfo.delta;

        //操作処理
        this.control(gameInfo, input);

        //死亡処理
        Debug.addText(["hp", this.hp]);
        if(this.isDead()){
            this.enable = false;
            this.dispatchEvent("playerDeath", new GameEvent(this));
        }

        //ダメージアニメーション
        const value = this._damageAnim.getValue(gameInfo.delta);
        if(value != undefined) this.visible = (value == 1);

        //ダメージ中は吹き飛ばし効果
        if(this.damageCount > 0){
            this.damageCount -= gameInfo.delta;
            this.dotGroup.explosion(this.x, this.y, 0.4);
        }
        
        super.update(gameInfo, input);

        Debug.addText(["x", this.x.toFixed()], ["y", this.y.toFixed()]);
        Debug.addText(["enable", this.enable]);

        Debug.addText(["c", mainGame.gameInfo.currentScene]);

        //エフェクトテスト
        const dx = this.x - this.px;
        const dy = this.y - this.py;
        this.px = this.x;
        this.py = this.y;
        const dis = dx*dx + dy * dy;
        this.dMove += dis;
        if(this.dMove > 80){
            this.dMove %= 80;
            mainGame.currentScene.dotGroup.addDot(DotObj.id.Effect, [this.x+this.w/2, this.y+this.h/2]);
        }
    }

    //操作
    control(gameInfo, input){
        if (this.controlable){
            const fixSpeed = this.speed * gameInfo.delta;
            if (input.getKey("ArrowUp")){ this.y -= fixSpeed}
            if (input.getKey("ArrowDown")){this.y += fixSpeed}
            if (input.getKey("ArrowLeft")){ this.x -= fixSpeed}
            if (input.getKey("ArrowRight")){this.x += fixSpeed}

            //if(input.getKey("z")){this.shot(new NormalBullet(this, 0, -5))};
            //if(input.getKey("x")){this.shot(new BombBullet(this, 0, -5))};
            if(input.getKey("z")){this.shot(DotObj.id.NormalBullet, this, 0, -5)};
            if(input.getKey("x")){this.shot(DotObj.id.BombBullet, this, 0, -5)};
            if(input.getKeyDown(" ")){this.shot(DotObj.id.Tullet, this, 0, -4)};
            
        }   
    }

    //射撃処理
    shot(bullet, ...args){
        if (this._shotIntervalCount >= this.shotInterval){
            if(bullet == DotObj.id.NormalBullet || bullet == DotObj.id.BombBullet){
                console.log("shot");
                this.dotGroup.addDot(bullet, args);
                this._shotIntervalCount = 0;

            }
        }
        if (bullet == DotObj.id.Tullet){  //タレット
            if(this.tulletNum > 0 && this.tulletF){
                const dot = this.dotGroup.addDot(bullet, args);
                dot.addEventListener("stop", (e) => {
                    this.tulletF = true;
                    dot.removeEventListener("stop");
                });
                this.tulletF = false;

                //this.tulletNum--;
            }
        }
    }

    hit(obj){
        if(!this.muteki){
            if(obj.isExistTags(this.hitTags)){
                //ダメージ
                const num = 50;
                this.damage(num);
            }
        }
        
        //ポイント加算
        if(obj.isExistTag(Tag.point_dot)){
            mainGame.currentScene.score += obj.point;
        }
    }

    //ダメージ処理
    damage(power){
        this.hp -= 1;

        //爆発処理
        let dx,dy;
        const centerPos = this.getCenterPos();
        const radian = 5;
        for (let i = 0; i < power; i++){
            const x = Math.random() - 0.5;
            const y = Math.random() - 0.5;
            const d = Utils.getUnitVector(0, 0, x, y);
            dx = d.x * radian * Math.random();
            dy = d.y * radian * Math.random();
            this.dotGroup.addDot(DotObj.id.RedSplash, [centerPos.x, centerPos.y, dx, dy]);
        }

        this.muteki = true;
        this.controlable = false;
        this.absorbable = false;
        this.damageCount = this.damageCountT;
        this._damageAnim.start();
    }

    setDamageAnim(){
        //死亡時アニメーション
        this.damageCountT = 20;
        this.damageCount = 0;
        this._damageAnim = new Animator();
        this._damageAnim.addAnim(new LinearAnimation(-1, -1, 60))
                        .addAnim(new LinearAnimation(1, 1, 10))
                        .addAnim(new LinearAnimation(-1, -1, 10))
                        .addAnim(new LinearAnimation(1, 1, 10))
                        .addAnim(new LinearAnimation(-1, -1, 10))
                        .addAnim(new LinearAnimation(1, 1, 10))
                        .addAnim(new LinearAnimation(-1, -1, 10))
                        .addAnim(new LinearAnimation(1, 1, 10))
                        .addAnim(new LinearAnimation(-1, -1, 10));
        this._damageAnim.addEventListener("animNext", (e) => {
            if(e = 1) {
                this.controlable = true;
                this.absorbable = true;
            }
        });
        this._damageAnim.addEventListener("animEnd", (e) =>{
            this.visible = true;
            this.muteki = false;
        });
    }

    isDead(){
        return this.hp <= 0 && this.damageCount <= 0;
    }
}

//スコアビュー
export class ScoreView extends GameObject{
    constructor(x, y, digitNum = 8){
        super(x,y,0,0);
        this.scoreObjs = [];
        this.digitNum = digitNum;
        
        //スコア画像セット
        this.scoreMoji = new Sprite(assets.get("score"), new Rectangle(0, 0, 50, 50));
        for (let i = 0; i < 10; i++){
            this.scoreObjs.push(new Sprite(assets.get("s"+String(i)), new Rectangle(0,0,10,10)));
        }
    }

    update(gameInfo, input){
        super.update(gameInfo, input);
    }

    render(canvas){
        //スコア描画
        const context = canvas.getContext("2d");
        let score = mainGame.currentScene.score;
        if(score != undefined){
            context.drawImage(this.scoreMoji.image, this.x, this.y);

            const w = this.scoreObjs[0].rect.w;
            for (let i = 0; i < this.digitNum; i++){
                let ix = this.x + i * w + this.scoreMoji.rect.w;
                context.drawImage(this.scoreObjs[this.getDigit(score, this.digitNum-i)].image, ix, this.y);
            }
            super.render(canvas);
        }
    }

    //index桁目の数字を返す
    getDigit(x, index){
        for(let i = 0; i < index-1; i++){
            if(x == 0) return 0;
            x /= 10;
        }
        return parseInt(x) % 10;
    }
}