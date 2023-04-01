import GameObject from "./engine/Game/GameObject";
import { getUnitVector } from "./engine/Utils";
import Rectangle from "./engine/Rectangle";
import { Tag } from "./tag";
import * as Debug from "./engine/Debug"
import GameEvent from "./engine/Game/GameEvent"


/*** ドット系 ***/

//ドット親オブジェ
export class DotObj extends GameObject{
    //オブジェid
    static id = {Point:0, 
        NormalBullet:1, 
        BombBullet:2, 
        RedSplash:3, 
        Missile:4, 
        EnemyNormalBullet:5, 
        Tullet:6,
        Effect:7}   
        
    constructor(type, ...args){
        super(0,0,0,0);
        this.setFuncs()

        this.setType(type, args);
    }

    initFunc(x, y, w, h, color, gravity = true, dx = 0, dy = 0, maxDx = 4, maxDy = 4){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.dx = dx;
        this.dy = dy;
        this.maxDx = maxDx;
        this.maxDy = maxDy;

        this.color = color;
        this.gravity = gravity;
    }

    //属性セット(初期化も含む)
    setType(type, initArgs){
        this.type = type;
        this.args = initArgs;
        this.originTags = [];

        this.initFuncs[type](initArgs);
    }

    //速度加算
    update(gameInfo, input){
        //画面外に出ると削除
        if (this.isOutOfScreen(gameInfo)){
            this.enable = false;
        }
        
        //重力
        if(this.gravity) {
            const g = gameInfo.stageInfo.g * gameInfo.delta;
            const resistance = Math.pow(gameInfo.stageInfo.resistance, gameInfo.delta);
            this.dy += g;
            this.dx += -Math.sign(this.dx) * g;
            //速度抑え
            if(Math.abs(this.dy) > this.maxDy) this.dy *= resistance;
        }

        //更新
        const fixDx = this.dx * gameInfo.delta;
        const fixDy = this.dy * gameInfo.delta;
        this.x += fixDx;
        this.y += fixDy;

        this.updateFuncs[this.type](gameInfo, input);
    }

    //ドット描画
    render(canvas){
        this.renderFuncs[this.type](canvas);
    }

    //画面外
    isOutOfScreen(gameInfo){
        return this.isOutOfScreenFuncs[this.type](gameInfo);
    }

    //あたり処理
    hit(obj){
        this.hitFuncs[this.type](obj);
    }


    //初期化関数
    setFuncs(){
        this.initFuncs = [];
        this.updateFuncs = [];
        this.hitFuncs = [];
        this.isOutOfScreenFuncs = [];
        this.renderFuncs = [];

        //標準の画面外判定
        const isOutOfScreenDefault = (gameInfo) => {
            const rect = new Rectangle(0, 0, gameInfo.w, gameInfo.h);
            return !(rect.hitTest(this.getRect()));
        }

        const renderDefault = (canvas) => {
            const context = canvas.getContext("2d");
            context.fillStyle = this.color;
            context.fillRect(this.x, this.y, this.w, this.h);
        }

        //ポイントドット
        //引数:(x, y, dx, dy, maxDy = 3, absorptionSpeed = 6)
        this.initFuncs[DotObj.id.Point] = (args) =>{
            //デフォルト引数
            let maxDy = args[4];
            if(maxDy == undefined) maxDy = 3;
            let absorptionSpeed = args[5];
            if(absorptionSpeed == undefined) absorptionSpeed = 6;

            this.initFunc(args[0], args[1], 1, 1, "#FFFFFF", true, args[2], args[3], 10, maxDy)
            this.originTags.push(Tag.point_dot);
            this.absorptionSpeed = absorptionSpeed;   //吸収スピード
            this.point = 1;
        }
        this.updateFuncs[DotObj.id.Point] = (gameInfo, input) => {};
        this.renderFuncs[DotObj.id.Point] = renderDefault;
        this.hitFuncs[DotObj.id.Point] = (obj) => {
            if(obj.isExistTag(Tag.player)){
                if (obj.absorbable) this.enable = false;
            }
            if(obj.isExistTag(Tag.point_circle)){
                //吸収処理
                if(obj.parent.absorbable){
                    if (this.getDistance(obj) * 2 <= obj.w){    //this.getDistance(obj) <= obj.w / 2
                        this.gravity = false;
                        const directionVec = this.getDirectionToObject(obj);
                        this.dx = this.absorptionSpeed * directionVec.dx;
                        this.dy = this.absorptionSpeed * directionVec.dy;
                    }
                }
            }
        }
        this.isOutOfScreenFuncs[DotObj.id.Point] = (gameInfo) => {
            return this.y >= gameInfo.h;
        }

        //バレットドットの初期化関数
        const bulletInit = (player, w, h, dx, dy, color) => {
            const x = player.getCenterPos().x - (w / 2);
            const y = player.y - h;
            this.initFunc(x, y, w, h, color, false, dx, dy);
            this.player = player;
            this.originTags.push(Tag.bullet);
        }
        const bulletHit = (obj) =>{
            if(obj.isExistTag(Tag.enemy)){
                this.enable = false;
            }
        }
        //ノーマルバレット
        //引数:(player, dx, dy)
        //引数:(x, y, dx, dy)
        this.initFuncs[DotObj.id.NormalBullet] = (args) =>{
            if(args.length == 3){
                bulletInit(args[0], 3, 3, args[1], args[2], "#FFFFFF");
            }else{
                this.initFunc(args[0], args[1], 3, 3, "#FFFFFF", false, args[2], args[3], 10, 10);
                this.originTags.push(Tag.bullet);
            }
            this.originTags.push(Tag.normal_bullet);
        }
        this.updateFuncs[DotObj.id.NormalBullet] = (gameInfo, input) => {};
        this.hitFuncs[DotObj.id.NormalBullet] = bulletHit;
        this.renderFuncs[DotObj.id.NormalBullet] = renderDefault;
        this.isOutOfScreenFuncs[DotObj.id.NormalBullet] = isOutOfScreenDefault;

        //爆弾
        //引数:(player, dx, dy, power=10)
        this.initFuncs[DotObj.id.BombBullet] = (args) => {
            let power = args[3];
            if(power == undefined) power = 10;
            bulletInit(args[0], 3, 3, args[1], args[2], "#FF0000")
            this.power = power;
        }
        this.updateFuncs[DotObj.id.BombBullet] = (gameInfo, input) => {};
        this.hitFuncs[DotObj.id.BombBullet] = (obj) => {
            if(obj.isExistTag(Tag.enemy)){
                this.enable = false;
                for (let i = 0; i < this.power; i++){
                    const dx = Math.random() * 4 - 2;
                    const dy = Math.random() * 4 - 2;
                    this.player.dotGroup.addDot(DotObj.id.RedSplash, [this.x, this.y, dx, dy]);
                }
            }
        }
        this.renderFuncs[DotObj.id.BombBullet] = renderDefault;
        this.isOutOfScreenFuncs[DotObj.id.BombBullet] = isOutOfScreenDefault;

        //赤飛沫
        //引数:(x, y, dx, dy)
        this.initFuncs[DotObj.id.RedSplash] = (args) => {
            //飛沫最低速度
            if(Math.abs(args[2]) < 2 && Math.abs(args[3]) < 2){
                if (Math.random() < 0.5) args[2] = Math.sign(args[2]) * 2;
                else args[3] = Math.sign(args[3]) * 2;
            }
            this.initFunc(args[0], args[1], 1, 1, "#FF0000", false, args[2], args[3], 10, 10);
            this.originTags.push(Tag.splash);
        }
        this.updateFuncs[DotObj.id.RedSplash] = (gameInfo, input) => {}
        this.hitFuncs[DotObj.id.RedSplash] = bulletHit;
        this.renderFuncs[DotObj.id.RedSplash] = renderDefault;
        this.isOutOfScreenFuncs[DotObj.id.RedSplash] = isOutOfScreenDefault;


        //タレット
        /* 発射後スペースで停止、そのあとタレット */
        //引数:(player, dx, dy)
        this.initFuncs[DotObj.id.Tullet] = (args) => {
            bulletInit(args[0], 8, 8, args[1], args[2], "#999999");
            this.originTags.push(Tag.tullet);
            this.shotInterval = 10; //発射間隔
            this.shotIntervalCount = this.shotInterval;
            this.shotR = 30;        //発射回転角度
            this.culShotR = 0;
            this.life = 500;    //体力（時間とともに減少）
        }
        this.isOutOfScreenFuncs[DotObj.id.Tullet] = isOutOfScreenDefault;
        this.updateFuncs[DotObj.id.Tullet] = (gameInfo, input) => {
            //停止処理
            if(this.dx == 0 && this.dy == 0) this.dispatchEvent("stop", new GameEvent(this));
            if(input.getKeyDown(" ")) {
                this.dx = 0;
                this.dy = 0;
            }
            
            //停止中の処理
            if(this.dx == 0 && this.dy == 0){
                if(this.shotIntervalCount > this.shotInterval){
                    const radian = this.culShotR * Math.PI / 180;
                    const dx = Math.cos(radian)*4;
                    const dy = Math.sin(radian)*4;
                    this.player.dotGroup.addDot(DotObj.id.NormalBullet, [this.x, this.y, dx, dy]);

                    this.shotIntervalCount -= this.shotInterval;
                    this.culShotR = (this.shotR + this.culShotR) % 360
                }
                //死亡処理
                this.life -= gameInfo.delta;
                if(this.life < 0) this.enable = false;

                this.shotIntervalCount += gameInfo.delta;
            }
            
            if(this.isOutOfScreenFuncs[DotObj.id.Tullet](gameInfo)){
                this.dispatchEvent("stop", new GameEvent(this));
            }
            
        }
        this.renderFuncs[DotObj.id.Tullet] = renderDefault;
        //敵にあたった瞬間も停止
        this.hitFuncs[DotObj.id.Tullet] = (obj) => {
            if (obj.isExistTag(Tag.enemy)){
                this.dx = 0;
                this.dy = 0;
            };
        };


        const enemyBulletInit = (enemy, w, h, dx, dy, color) => {
            const x = enemy.getCenterPos().x - (w / 2);
            const y = enemy.getCenterPos().y - (h / 2);
            this.initFunc(x, y, w, h, color, false, dx, dy);
            this.enemy = enemy;
            this.originTags.push(Tag.enemy_bullet);
        }
        //敵弾丸
        //引数: (enemy, w, dx, dy)
        this.initFuncs[DotObj.id.EnemyNormalBullet] = (args) =>{
            enemyBulletInit(args[0], args[1], args[1], args[2], args[3], "#FF0000");
        }
        this.isOutOfScreenFuncs[DotObj.id.EnemyNormalBullet] = isOutOfScreenDefault;
        this.updateFuncs[DotObj.id.EnemyNormalBullet] = (gameInfo, input) => {};
        this.renderFuncs[DotObj.id.EnemyNormalBullet] = (canvas) => {
            const context = canvas.getContext("2d");
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(this.x, this.y, this.w*2, 0, 2*Math.PI, false);
            context.fill();
        }
        this.hitFuncs[DotObj.id.EnemyNormalBullet] = (obj) =>{
            if (obj.isExistTag(Tag.player)){
                if (obj.hitable) this.enable = false;
            }
        }

        //エフェクトドット
        const effectDotInit = (x, y) => {
            this.initFunc(x, y, 10, 10, null, false);
            this.degree = 0;
            this.count = 0;
            this.countN = 100;
        }
        this.initFuncs[DotObj.id.Effect] = (args) => effectDotInit(...args);
        this.isOutOfScreenFuncs[DotObj.id.Effect] = isOutOfScreenDefault;
        this.updateFuncs[DotObj.id.Effect] = (gameInfo, input) => {
            this.degree = (this.degree+0.1);
            this.count++;
            if(this.count > this.countN) this.enable = false;    
        };
        this.renderFuncs[DotObj.id.Effect] = (canvas) => {
            const context = canvas.getContext("2d");
            context.save();

            context.beginPath();
            context.strokeStyle = "Gray";
            context.translate(this.x, this.y);
            context.rotate(this.degree);
            context.strokeRect(-this.w/2, -this.h/2, this.w, this.h);

            context.restore();
        }
        this.hitFuncs[DotObj.id.Effect] = (obj) => {};
    }
}

export class DotGroup extends GameObject{
    constructor(maxNum = 2000, parent=undefined){
        super(0,0,0,0);
        this.maxNum = maxNum;   //最大ドット数
        this.originTags.push(Tag.dot_group);
        for (let i = 0; i < maxNum; i++){
            const dotObj = new DotObj(0, -5, 0, 0, 0);
            dotObj.enable = false;
            dotObj.parent = this;
            this.childs.push(dotObj);
        }
    }

    render(canvas){
        super.render(canvas);
    }

    update(gameInfo, input){
        
        //ガベージしながら更新処理
        for (let i = 0; i < this.childs.length; i++){
            if (this.childs[i].enable){
                this.childs[i].update(gameInfo, input);
            }
        }
        Debug.addText(["dotgroup.len", this.childs.length])
    }

    //ドット追加（新機能)
    addDot(type, args){
        for (let i = 0; i < this.childs.length;i++){
            if(!this.childs[i].enable){
                this.childs[i].setType(type, args);
                this.childs[i].enable = true;
                return this.childs[i];
            }
        }
        return undefined;
    }

    //芸術は爆発だ
    explosion(x, y, force){
        this.childs.forEach((child) =>{
            if(child.gravity && child.enable){
                const d = getUnitVector(x, y, child.x, child.y);
                child.dx += d.x * force;
                child.dy += d.y * force;
            }
        });
    }

    init(){
        this.childs.forEach((child) => {
            child.enable = false;
        })
    }
}