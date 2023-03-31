import { GameObject, Utils } from "./engine";
import { Animator } from "./animation";
import { Tag } from "./tag";
import { DotObj } from "./dotObj";

//クラス追加方法
/*
    -タイプ＆クラスネーム追加
    -クラス作成
*/


//敵の体 親クラス
export class EnemyPart extends GameObject{
    static Type = {None: -1, normal : 0, red : 1, battery : 2};                           //タイプ数値
    static ClassName = ["NormalEnemyPart", "RedEmemyPart", "BatteryEnemyPart"];

    constructor(dotGroup, x, y, w, h, point = 100, radius = 2,  color = "#9999FF", hitTags = [Tag.bullet]){
        super(x, y, w, h);
        this.dotGroup = dotGroup;       //追加用
        this.originTags.push(Tag.enemy);   
        this.point = point;
        this.color = color;
        this.radius = radius;   //爆発半径
        this.hitTags = hitTags; //死亡判定タグ
    }

    hit(obj){
        //ポイント出す
        if(obj.isExistTags(this.hitTags)){
            this.enable = false;
            let centerPos;
            for (let i = 0; i < this.point; i++){
                centerPos = this.getCenterPos();
                const dx = Math.random() * this.radius - this.radius / 2;
                const dy = Math.random() * this.radius - this.radius / 2;
                this.dotGroup.addDot(DotObj.id.Point, [centerPos.x, centerPos.y, dx, dy]);
            }
        }
    }

    render(canvas){
        const context = canvas.getContext("2d");
        context.fillStyle = this.color;
        context.strokeStyle = "#FFFFFF";
        context.fillRect(this.x, this.y, this.w, this.h);
        context.strokeRect(this.x, this.y, this.w, this.h);
        super.render(canvas);
    }
}

//タイプ別　敵部品
//タイプはEnemyPart.Typeに適宜保存
//Typeが存在するのは敵をつくる際にかんたん化するため
//コンストラクタは(dotGroup, x, y, w, h)の順

//ノーマル
//ただポイントを発生させる体当たり野郎
export class NormalEnemyPart extends EnemyPart{
    constructor(dotGroup, x, y, w, h){
        super(dotGroup, x, y, w, h, 20, 3, "#9999FF");
        this.hitTags.push(Tag.splash);
    }
}

//レッド
//試験用
export class RedEmemyPart extends EnemyPart{
    constructor(dotGroup, x, y, w, h){
        super(dotGroup, x, y, w, h, 100, 3, "#FF9999");
        this.hitTags.push(Tag.splash);
    }
}

//砲台
//弾発射
export class BatteryEnemyPart extends EnemyPart{
    constructor(dotGroup, x, y, w, h){
        super(dotGroup, x, y, w, h, 50, 3, "#FF2222");
        //this.hitTags.push(Tag.splash);
        this.shotInterval = 30;
        this.shotIntervalCount = this.shotInterval;
    }

    update(gameInfo, input){
        super.update(gameInfo, input);
        const pPos = this.parent.player.getCenterPos();
        const cPos = this.getCenterPos();
        const dx = pPos.x - cPos.x;
        const dy = pPos.y - cPos.y;
        const radian = Math.atan2(dy, dx);
        const r = 3;
        if(this.shotInterval < this.shotIntervalCount){
            this.dotGroup.addDot(DotObj.id.EnemyNormalBullet, [this, 2, r*Math.cos(radian), r*Math.sin(radian)]);
            this.shotIntervalCount -= this.shotInterval;
        }
        this.shotIntervalCount += gameInfo.delta;
    }
}

const enemyPartClasses = [NormalEnemyPart, RedEmemyPart, BatteryEnemyPart]


//エネミー
//敵リソース管理
export class Enemy extends GameObject{
    constructor(player, dotGroup, x, y, dw, dh, enemyMap){
        super(x, y, 0, 0);
        this.dw = dw;
        this.dh = dh;
        this.player = player;
        this.animators = []; //x,yの２つ
        for (let i = 0; i < 2; i++){
            this.animators.push(new Animator("enemy" + i)); 
        }

        //enemyMap : 敵の体情報\
        for (let i = 0; i < enemyMap.h; i++){
            for (let j = 0; j < enemyMap.w; j++){
                this.addEnemyPart(dotGroup, enemyMap.map[i][j], j * dw, i * dh);
            }
        }

        this.originTags.push(Tag.enemy_group);
    }

    init(){
        this.animReset();
        this.animStart();
        this.childs.forEach((child) => child.enable = true);
        this.enable = true;
    }

    //タイプ別に敵追加
    addEnemyPart(dotGroup, type, x, y){
        if(type == EnemyPart.Type.None) return;

        this.addChild(new enemyPartClasses[type](dotGroup, x, y, this.dw, this.dh));
    }

    update(gameInfo, input){
        if(this.anim(gameInfo)){
            //アニメーション終了時
            this.destroy();
        }
        super.update(gameInfo, input);
    }

    //x座標アニメーション追加
    addXAnim(xAnim){
        this.animators[0].addAnim(xAnim);
        return this;
    }

    //y座標アニメーション追加
    addYAnim(yAnim){
        this.animators[1].addAnim(yAnim);
        return this;
    }

    //アニメーション（返り値はアニメーション終了フラグ）
    anim(gameInfo){
        if(this.animators[0] != undefined){
            const valueX = this.animators[0].getValue(gameInfo.delta);
            const valueY = this.animators[1].getValue(gameInfo.delta);
            if(valueX != undefined) this.x = valueX;
            if(valueY != undefined) this.y = valueY;
            if(valueY == undefined && valueX == undefined) return true;
            return false;
        }
    }

    //アニメーションスタート
    animStart(){
        this.animators[0].start();
        this.animators[1].start();
    }

    //アニメーションリセット
    animReset(){
        this.animators[0].reset();
        this.animators[1].reset();
    }

    //死亡
    destroy(){
        this.enable = false;
        console.log("destroy");
    }

    //死亡判定
    isDead(){
        let f = true;
        this.childs.forEach((child) =>{
            if(child.enable) f = false;
        });
        if(!this.enable) f = true;
        return f;
    }
}


//エネミーマップ
export class EnemyMap {
    constructor(map = []){
        this.map = map;
        this.w = this.map[0].length;
        this.h = this.map.length;
    }
}

//エネミーグループ
export class EnemyGroup extends GameObject{
    constructor(dotGroup, enemys = []){
        super(0, 0, 0, 0);
        this.dotGroup = dotGroup;
        this.childs = enemys;
    }

    init(){
        this.childs.forEach((child) => child.init())
    }

    isDeadAll(){
        let f = true;
        this.childs.forEach((child) =>{
            if(!child.isDead()) f = false;
        })
        return f;
    }
}