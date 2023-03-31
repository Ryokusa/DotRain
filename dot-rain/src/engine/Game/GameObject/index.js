import EventDispatcher from "../../EventDispatcher";
import Rectangle from "../../Rectangle";

//ゲームオブジェ
export default class GameObject extends EventDispatcher{
    constructor(local_x, local_y, w, h, originTags = []){
        super();
        this.rect = new Rectangle(this.x, this.y, this.w, this.h);
        this.childs = [];
        this._parent = undefined;
        this.local_x = local_x;
        this.local_y = local_y;
        this.w = w;
        this.h = h;
        this._w = w;    //初期値
        this._h = h;    //初期値
        this.enable = true;
        this.tags = []; //あたり判定用
        this.originTags = originTags;  //固有タグ
        this.visible = true;
        this.scene = undefined;
        this.hitable = true;    //当たり判定
        
        this.addEventListener("hit", (e) => this.hit(e.target));
    }

    init(){}

    //更新処理
    update(gameInfo, input) {
        this.childs.forEach((child) => {
            if(child.enable){
                child.update(gameInfo, input);
            }
        });
    }

    //描画処理
    render(canvas) {
        this.childs.forEach((child) => {
            if (child.enable && child.visible){
                child.render(canvas);
            }
        });
    }

    //矩形取得
    getRect(){
        this.rect.w = this.w;
        this.rect.h = this.h;
        return this.rect;
    }

    //子追加
    addChild(obj){
        obj.parent = this;
        this.childs.push(obj);
    }

    //インデックス削除
    removeChildFromIndex(index){
        this.childs.splice(index, 1);
    }
    
    //オブジェから削除
    removeChildFromObj(dotObj){
        const index = this.childs.indexOf(dotObj);
        this.removeFromIndex(index);
    }
    
    //衝突処理
    hit(obj){}

    //中心
    getCenterPos(){
        return {x : this.x + this.w / 2, y : this.y + this.h / 2}
    }

    //他オブジェの方向取得
    getDirectionToObject(obj){
        const objCenterPos = obj.getCenterPos();
        const centerPos = this.getCenterPos();
        let result = {dx:0, dy:0};
        const radian = Math.atan2(objCenterPos.y - centerPos.y, objCenterPos.x - centerPos.x);
        result.dx = Math.cos(radian);
        result.dy = Math.sin(radian);
        return result;
    }

    //全子オブジェ取得
    getAllChilds(f = false){
        let list = [];
        this.childs.forEach((child) => {
            if(child.enable && f){
                list.push(child);
                Array.prototype.push.apply(list, child.getAllChilds(f));
            }
        });
        return list;
    }

    //タグ操作用
    isExistTag(tag){
        if (this.originTags.indexOf(tag) != -1){
            return true;
        }else if (this.tags.indexOf(tag) != -1){
            return true;
        }
        return false;
    }

    //tagsのうちどれか
    isExistTags(tags){
        let flag = false;
        tags.forEach((tag) => {
            if (this.originTags.indexOf(tag) != -1){
                flag = true;
            }else if (this.tags.indexOf(tag) != -1){
                flag = true;
            }
        });
        return flag;
    }

    //objとの距離
    getDistance(obj){
        const objCenterPos = obj.getCenterPos();
        const centerPos = this.getCenterPos();
        const dx = Math.abs(objCenterPos.x - centerPos.x);
        const dy = Math.abs(objCenterPos.y - centerPos.y);
        return Math.sqrt(dx * dx + dy * dy);
    }

    //リサイズ（倍率）
    resize(multi){
        this.w = this._w * multi;
        this.h = this._h * multi;
        this.childs.forEach((child) => {
            child.resize(multi);
        });
    }

    // //リサイズ(ピクセル)
    // resize(w, h){
    //     this.w = w;
    //     this.h = h;
    // }

    //グローバル座標セッター・ゲッター
    //高速化のために代入時にはローカル・グローバル両方計算
    //および矩形データ更新
    //getによる負荷を下げるため
    
    get x(){
        return this._x;
    }

    set x(value){
        if (this._parent != undefined) this._local_x = value - this._parent.x;
        else this._local_x = value;
        this._x = value;
        this.rect.x = value;
        this.childs.forEach((child) => child.x = value + child.local_x);
    }
    
    get y(){
        return this._y;
    }

    set y(value){
        if (this._parent != undefined) this._local_y = value - this._parent.y;
        else this._local_y = value;
        this._y = value;
        this.rect.y = value;
        this.childs.forEach((child) => child.y = value + child.local_y);
    }

    set local_x(value){
        if (this._parent != undefined) this.x = value + this.parent.x;
        else this.x = value;
    }

    get local_x(){
        return this._local_x;
    }

    set local_y(value){
        if (this._parent != undefined) this.y = value + this.parent.y;
        else this.y = value;
    }

    get local_y(){
        return this._local_y;
    }

    set parent(value){
        this._parent = value;
        //グローバル
        if(this._parent != undefined){
            this.x = this._parent.x + this.local_x;
            this.y = this._parent.y + this.local_y;
        }else{
            this.x = this.local_x;
            this.y = this.local_y;
        }
    }

    get parent(){
        return this._parent;
    }
}