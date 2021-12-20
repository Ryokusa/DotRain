"use strict";

//汎用関数
class Utils{
    //クラス取得用
    static getClass(classname){
        return Function('return (' + classname + ')')();
    }

    //2点の単位ベクトル
    static getUnitVector(x1, y1, x2, y2){
        const dx = x2 - x1;
        const dy = y2 - y1;
        const radian = Math.atan2(dy, dx);
        return {x: Math.cos(radian), y: Math.sin(radian)};
    }

    static getDistance(x1, y1, x2, y2){
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    //クイックソート関数
    static quickSort(a, startID,endID){
        //範囲の間にある値をピポットに設定する
        var pivot = a[Math.floor((startID + endID)/2)];
        //引数を左端、右端として変数にいれる
        var left = startID;
        var right = endID;

        //ピポットより小さい値を左側へ、大きい値を右側へ分割する
        while(true){
            //leftの値がpivotより小さければleftを一つ右へ移動する
            while(a[left]<pivot){
                left++;
            }
            //rightの値がpivotより小さければrightを一つ左へ移動する
            while(pivot<a[right]){
                right--;
            }
            //leftとrightの値がぶつかったら、そこでグループ分けの処理を止める。
            if(right <= left){
                break;
            }

            //rightとrightの値がぶつかっていない場合、leftとrightを交換
            //交換後にleftを後ろへ、rightを前へ一つ移動する
            const tmp =a[left];
            a[left] =a[right];
            a[right] =tmp;
            left++;
            right--;
        }

        //左側に分割できるデータがある場合、quickSort関数を呼び出して再帰的に処理を繰り返す。
        if(startID < left-1){
            Utils.quickSort(a, startID,left-1);
        }
        //右側に分割できるデータがある場合、quickSort関数を呼び出して再帰的に処理を繰り返す。
        if(right+1 < endID){
            Utils.quickSort(a, right+1,endID);
        }
    }

    static insertionSort(a, func){
        //未整列の部分から値を１つずつ取り出すfor文
        for(let i = 1; i < a.length; i++){
            //「挿入する値」を変数に一時保存する
            const tmp = a[i];

            //「整列済みの部分」のどこに挿入すれば良いか後ろから前に向かって順番に判断する
            for(var j = i-1; j>=0; j--){
                //「挿入する値」が小さい場合、調べた値を１つ後ろへずらす
                if(func(a[j], tmp) > 0){
                    a[j+1] = a[j];
                }else{
                    //小さくなければ、ずらす処理を止める
                    break;
                }
            }
            //ずらす処理が終わったところに「挿入する値」を入れる
            a[j+1] = tmp;
        }
    }

    //32ビットを開ける11 -> 0101
    static bitSeparate32(x){
        x = (x | x << 8) & 0x00ff00ff;
        x = (x | x << 4) & 0x0f0f0f0f;
        x = (x | x << 2) & 0x33333333;
        x = (x | x << 1) & 0x55555555;
        return x;
    }

    //モートン空間座標(引数には分割空間の座標)
    static getMortonNumber(x, y){
        return this.bitSeparate32(x) | (this.bitSeparate32(y) << 1)
    }
}

//汎用色クラス
//キーワード&16進数&rgba表記
class Color{
    constructor(){
        //基本色
        this.colors = {black:"#000000", gray:"#808080", silver:"C0C0C0", white:"#FFFFFF", blue:"#0000FF", navy:"#000080", teal:"#008080", green:"#008000", lime:"#00FF00", aqua:"#00FFFF", yellow:"FFFF00", red:"#FF0000", fuchsia:"#FF00FF", olive:"#808000", purple:"#800080", maroon:"#800000"};
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 1;
    }

    setRGB(r, g, b){
        this.r = r;
        this.g = g;
        this.b = b
    }

    //文字から色を取得
    setRGBfromStr(s){
        //基本色があるなら取得
        if(this.colors[s]) s = this.colors[s];
        
        //16進数
        if(s[0] == '#'){
            let x = [];
            for (let i = 0; i < 6; i+=2){
                x[i/2] = parseInt(s.slice(i+1,i+3), 16);
            }
            [this.r, this.g, this.b] = x;
            this.a = 1;
            return;
        }

        //数値が3つ以上ある場合
        const color = s.match(/\d+(?:\.\d+)?/g)
        if (color.length >= 3){
            this.r = parseInt(color[0]);
            this.g = parseInt(color[1]);
            this.b = parseInt(color[2]);
        }
        if (color.length == 4) this.a = parseFloat(color[3]);
        else this.a = 1
    }
}

//デバッグ
class Debug{
    static p;
    static text;
    static setDebugElement(element){
        this.p = document.createElement("p");
        element.appendChild(this.p);
    }

    //["名前", 変数]で表示
    static addText(...val){
        const len = val.length;
        for (let i = 0; i < len; i++){
            this.text += val[i][0] + ":" + val[i][1] + "\t";
        }
        this.text += "<br>";
    }

    static render(){
        this.p.innerHTML = this.text;
        this.text = "";
    }
}

//矩形クラス
class Rectangle {
    constructor(x, y, w, h){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    //あたり判定
    hitTest(rect) {
        const x1 = this.x, y1 = this.y, w1 = this.w, h1 = this.h;
        const x2 = rect.x, y2 = rect.y, w2 = rect.w, h2 = rect.h;
        return x1 < x2 + w2 && x1 + w1 > x2 &&
                y1 < y2 + h2 && y1 + h1 > y2;
    }

    //点との当たり判定
    hitTestP(x, y){
        if(this.x <= x && this.x+this.w >= x){
            if(this.y <= y && this.y + this.h >= y){
                return true;
            }
        }
        return false;
    }
}

class Point {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

//ゲームの基本情報
class GameInfo {
    constructor(title, w, h, maxFps, currentFps){
        this.title = title;
        this.w = w;
        this.h = h;
        this.maxFps = maxFps;
        this.currentFps = currentFps;
        this.timeCount = 0;
    }

    getCenterPos(){
        return {x: this.w/2, y: this.h/2};
    }

    get delta(){
        return this.maxFps / this.currentFps;
    }
}

//スプライトクラス
class Sprite {
    //矩形情報は切り抜き用
    constructor(img, rect) {
        this.image = img;
        this.rect = rect;
    }
}

//アセットローター
class AssetLoader {
    constructor(){
        this._promises = [];        //読み込み待機用
        this._assets = new Map();   //アセット格納
    }

    addImage(name, src){
        const img = new Image();
        img.src = src;

        //読み込み待機用
        const promise = new Promise((resolve, reject) =>
            img.addEventListener("load", (e) => {
                this._assets.set(name, img);
                resolve(img);
            }));

        this._promises.push(promise);
    }

    //非同期読み込み
    loadAll(){
        return Promise.all(this._promises);
    }

    //アセット取得
    get(name){
        return this._assets.get(name);
    }
}
//staticにできないので
const assets = new AssetLoader();

//イベントディスパッチャー
class EventDispatcher {
    constructor(){
        this._eventListeners = {}
    }

    addEventListener(type, callback) {
        if (this._eventListeners[type] == undefined){
            this._eventListeners[type] = [];
        }
        this._eventListeners[type].push(callback);
    }

    dispatchEvent(type, event) {
        const listeners = this._eventListeners[type];
        if(listeners != undefined) listeners.forEach(callback => callback(event));
    }

    removeEventListener(type){
        this._eventListeners[type] = undefined;
    }
}

//イベントリスナーで使うイベントクラス
class GameEvent{
    constructor(target){
        this.target = target;
    }
}

//ゲームオブジェ
class GameObject extends EventDispatcher{
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

//スプライトオブジェクト
class SpriteObject extends GameObject {
    constructor(x, y, sprite, tags=[]) {
        super(x, y,sprite.rect.w, sprite.rect.h, tags);
        console.log(this._w, this._h);
        this.sprite = sprite;
    }

    render(target){
        super.render(target)
        const context = target.getContext("2d");
        const rect = this.sprite.rect;
        context.drawImage(this.sprite.image,
            rect.x, rect.y,
            rect.w, rect.h,
            this.x, this.y,
            this.w, this.h);
    }

    //画面外とかの判定用
    /*
    isOutOfScreen(screenRect){
        rect = new Rect(this.x, this.y, this.w, this.h);
        return !(rect.hitTest(screenRect))
    }
    */
}

//入力情報クラス
class Input {
    constructor(keyMap, prevKeyMap, mouse) {
        this.keyMap = keyMap;
        this.prevKeyMap = prevKeyMap;
        this.mouse = mouse;
    }

    _getKeyFromMap(keyName, map) {
        if(map.has(keyName)) {
            return map.get(keyName);
        } else {
            return false;
        }
    }

    _getPrevKey(keyName) {
        return this._getKeyFromMap(keyName, this.prevKeyMap);
    }

    getKey(keyName) {
        return this._getKeyFromMap(keyName, this.keyMap);
    }

    getKeyDown(keyName) {
        const prevDown = this._getPrevKey(keyName);
        const currentDown = this.getKey(keyName);
        return (!prevDown && currentDown);
    }

    getKeyUp(keyName) {
        const prevDown = this._getPrevKey(keyName);
        const currentDown = this.getKey(keyName);
        return (prevDown && !currentDown);
    }

    getMouseInput(){
        return this.mouse;
    }
}

//入力受け取りクラス
class InputReceiver {
    constructor(el) {
        this._keyMap = new Map();
        this._prevKeyMap = new Map();
        this._mouse = new MouseInput();

        addEventListener('keydown', (ke) => this._keyMap.set(ke.key, true));
        addEventListener('keyup', (ke) => this._keyMap.set(ke.key, false));
        el.addEventListener("mousemove", (me) => {
            this._mouse.x = me.offsetX;
            this._mouse.y = me.offsetY;
        });
        el.addEventListener("mousedown", (me) => this._mouse.down = true);
        el.addEventListener("mouseup", (me) => this._mouse.down = false);
        el.addEventListener("touchmove", (te) => {
            te.preventDefault()
            const _elRect = el.getBoundingClientRect();
            this._mouse.x = te.changedTouches[0].clientX - _elRect.left - window.pageXOffset;
            this._mouse.y = te.changedTouches[0].clientY - _elRect.top - window.pageYOffset;
            Debug.addText([["touchmove", true]]);
        })
        el.addEventListener("touchstart", (te) => this._mouse.down = true);
        el.addEventListener("touchend", (te) => this._mouse.down = false);
    }

    getInput() {
        const keyMap = new Map(this._keyMap);
        const prevKeyMap = new Map(this._prevKeyMap);
        this._prevKeyMap = new Map(this._keyMap);
        return new Input(keyMap, prevKeyMap, this._mouse);
    }
}

//マウスインプット情報クラス
//TODO: スケールを変えても動作するように
class MouseInput {
    constructor(){
        this.x = 0;
        this.y = 0;
        this.down = false;
    }
}

class Scene extends EventDispatcher {
    constructor(name, renderingTarget, backgroundColor = "#FFFFFF", bgRenderMode="source-over") {
        super();

        this.name = name;
        this.renderingTarget = renderingTarget;
        this.backgroundColor = backgroundColor;
        this.bgRenderMode = bgRenderMode;   //背景のレンダーモード
        this.gameObjs = [];

        this.hitFunc  = function(r1, r2){
            const x = this.thread.x, y = this.thread.y;
            return (r1[x][0] + r1[x][2] - r2[x][0]) * ((r2[x][0] + r2[x][2]) - r1[x][0]) * (r1[y][1] + r1[y][3] - r2[y][1]) * ((r2[y][1] + r2[y][3]) - r1[y][1]);
        }

        this.valueCompareFunc = function(a, b) {
            if(a.value > b.value){
                return 1;
            }
            return -1;
        }
        this.compareFunc = function(a, b)  {
            return a - b;
        }

        this.allObjs = [];
        this.x_points = [];
        this.y_points = [];
    }

    add(gameObj) {
        gameObj.scene = this;
        this.gameObjs.push(gameObj);
    }

    remove(gameObj) {
        const index = this.gameObjs.indexOf(gameObj);
        this.gameObjs.splice(index, 1);
    }

    changeScene(newScene) {
        const event = new GameEvent(newScene);
        this.dispatchEvent("changescene", event);
    }

    //更新処理
    update(gameInfo, input){
        this._updateAll(gameInfo, input);
        this._hitTest();
        this._clearScreen(gameInfo);
        this._renderAll();
    }

    //ゲームオブジェ決定後
    compile(){
        this.allObjs = this.getAllobj();
        this.makePoints();
        const a = [{value:2}, {value:1}, {value:5},{value:6}, {value:4}];
        Utils.insertionSort(a, this.valueCompareFunc);
        console.log(a);
    }

    //すべてのオブジェクト(f : enable除外)
    getAllobj(f = false){
        let objs = []
        this.gameObjs.forEach((gameObj) => {
            if(gameObj.enable && f){
                objs.push(gameObj);
                Array.prototype.push.apply(objs, gameObj.getAllChilds(f));
            }
        });
        return objs;
    }

    //オブジェクト全更新
    _updateAll(gameInfo, input){
        this.gameObjs.forEach((gameObj) => {
            if(gameObj.enable){
                gameObj.update(gameInfo, input)
            }
        });
    }

    setArgs(args){
        this.args = args;
    }

    getArgs(){
        return args;
    }

    //ゲームオブジェクト全部に当たり判定
    _hitTest() {
        //すべてのオブジェ取得
        let allObjs = this.getAllobj(true);

        //高速化
        let rects = [];
        let objs = [];
        allObjs.forEach((obj) => {
            const rect = obj.getRect();
            //rects.push([rect.x, rect.y, rect.w, rect.h]);
            if(obj.hitable && obj.enable && rect.w != 0){
                rects.push(rect);
                objs.push(obj);
            }
        }); 

        const len = rects.length;
        Debug.addText(["len", len]);

        /*        
        if (this.kernel != undefined){
            const out = this.kernel(rects, rects);
            Debug.addText(["outlen", out.length]);

            
            for (let i = 0; i < len; i++){
                for (let j = i+1; j < len; j++){
                    if(out[i][j] > 0){
                        objs[i].dispatchEvent("hit", new GameEvent(objs[j]));
                        objs[j].dispatchEvent("hit", new GameEvent(objs[i]));
                    }
                }
            }
            
        }
        */
        
        

        //単純当たり判定
        if(rects.length != 0) this.hitTest3(rects, objs);
        
    }

    //総当り
    hitTest1(rects, objs){
        const len = rects.length;
        for (let i = 0; i < len; i++){
            for (let j = i+1; j < len; j++){
                if(rects[i].hitTest(rects[j])){
                    objs[i].dispatchEvent("hit", new GameEvent(objs[j]));
                    objs[j].dispatchEvent("hit", new GameEvent(objs[i]));
                }
            }
        }
    }

    //軸ごとの座標を取得
    makePoints(){
        const objs = this.allObjs;
        const len = objs.length;
        for (let i = 0; i < len; i++){
            const rect = objs[i].getRect();
            const x = rect.x, y = rect.y;
            this.x_points.push({value: x, isEnd: false, id:i});
            this.x_points.push({value: x+rect.w, isEnd: true, id:i});
            this.y_points.push({value: y, isEnd: false, id:i});
            this.y_points.push({value: y+rect.h, isEnd: true, id:i});
        }
    }

    //スイープ＆プルーン
    hitTest2(){

        const objs = this.getAllobj();

        //更新
        const len = this.x_points.length;
        for (let i = 0; i < len; i++){
            let x_point = this.x_points[i], y_point = this.y_points[i];
            const xRect = objs[x_point.id].getRect(), yRect = objs[y_point.id].getRect();
            if (x_point.isEnd) x_point.value = xRect.x + xRect.w;
            else x_point.value = xRect.x;
            if (y_point.isEnd) y_point.value = yRect.y + yRect.h;
            else y_point.value = yRect.y;
        }
        
        Utils.insertionSort(this.x_points, this.valueCompareFunc);
        Utils.insertionSort(this.y_points, this.valueCompareFunc);

        let x_pair = [];
        let y_pair = [];
        let x_save_ids = [];
        let y_save_ids = [];
        for (let i = 0; i < this.x_points.length; i++){
            if(!this.x_points[i].isEnd){
                const t = this.x_points[i].id;
                x_save_ids.forEach((index) => x_pair.push(this.getPairId(t, index)));
                x_save_ids.push(t);
            }else{
                x_save_ids.splice(x_save_ids.indexOf(this.x_points[i].id), 1);
            }
            if(!this.y_points[i].isEnd){
                const t = this.y_points[i].id;
                y_save_ids.forEach((index) => y_pair.push(this.getPairId(t, index)));
                y_save_ids.push(t);
            }else{
                y_save_ids.splice(y_save_ids.indexOf(this.y_points[i].id), 1);
            }
        }

        //Utils.insertionSort(x_pair);
        //Utils.insertionSort(y_pair);
        x_pair.sort(this.compareFunc);
        y_pair.sort(this.compareFunc);

        let i=0, j=0;
        while(x_pair[i] != undefined && y_pair[j] != undefined){
            if(x_pair[i] > y_pair[j]){
                j++;
            }else if(x_pair[i] < y_pair[j]){
                i++;
            }else{
                const id_i = x_pair[i] >> 16;
                const id_j = x_pair[i] & 65535;
                if(objs[id_j].enable && objs[id_i].enable&&objs[id_i].getRect().w != 0 && objs[id_j].getRect().w != 0){
                    objs[id_i].dispatchEvent("hit", new GameEvent(objs[id_j]));
                    objs[id_j].dispatchEvent("hit", new GameEvent(objs[id_i]));
                }
                i++;
                j++;
            }
        }

    }
    
    getPairId(x, y){
        if(x > y) return y << 16 | x;
        else return x << 16 | y;
    }

    //４分木
    hitTest3(rects, objs){
        let b4t = []; //一次元４分木(インデックスが格納)
        const n = 4;
        for (let i = 0; i < (Math.pow(4, n+1) - 1) / 3; i++) b4t[i] = [];
        let dx = 400 / (1 << n), dy = 300 / (1 << n);
        let rect;
        
        //４分木作成
        for (let i = 0; i < objs.length; i++){
            rect = objs[i].getRect();
            if (rect.w == 0) continue;
            const index1 = Utils.getMortonNumber(parseInt(rect.x / dx), parseInt(rect.y / dy));
            const index2 = Utils.getMortonNumber(parseInt((rect.x+rect.w-1) / dx), parseInt((rect.y+rect.h-1) / dy));
            let index = index1 ^ index2;

            //どの空間なのか
            let mask = 0b11;
            let l = n;
            for (let j = l-1; j >= 0; j--){
                if ((index & mask) != 0){
                    l = j;
                }
                mask <<= 2;
            }
            index = index1 >> ((n-l)*2);

            //作ったインデックスから4分木作成
            if((Math.pow(4, l)-1)/3+index >= b4t.length || index < 0) continue;   //念のため除外
            b4t[(Math.pow(4, l)-1)/3+index].push(i);
        }

        let index_stack = [[]];   //オブジェクトスタック
        let stack = [0];        //再帰用
        let count = 0
        let gameEvent1 = new GameEvent(undefined)
        let gameEvent2 = new GameEvent(undefined)
        while(stack.length != 0){
            let indexs = index_stack.pop();
            const index = stack.pop();

            //衝突判定
            for (let i = 0; i < b4t[index].length; i++){
                const id_i = b4t[index][i];
                if(objs[id_i].enable){
                    //内部同士
                    for (let j = i+1; j < b4t[index].length; j++){
                        const id_j = b4t[index][j];
                        if(rects[id_i].hitTest(rects[id_j])){
                            if(objs[id_j].enable){
                                gameEvent1.target = objs[id_j];
                                gameEvent2.target = objs[id_i];
                                objs[id_i].dispatchEvent("hit", gameEvent1);
                                objs[id_j].dispatchEvent("hit", gameEvent2);
                            }
                        }
                        count++;
                    }
                    
                    //内部・外部
                    for(let j = 0; j < indexs.length; j++){
                        const id_j = indexs[j];
                        if(rects[id_j].hitTest(rects[id_i])){
                            if(objs[id_j].enable){
                                gameEvent1.target = objs[id_j];
                                gameEvent2.target = objs[id_i];
                                objs[id_j].dispatchEvent("hit", gameEvent2);
                                objs[id_i].dispatchEvent("hit", gameEvent1);
                            }
                        }
                        count++;
                    }
                }
            }
            
            indexs = b4t[index].concat(indexs);
            if((index << 2)+1 >= b4t.length) continue; 
            for (let i = 1; i <= 4; i++){
                stack.push((index << 2) + i);
                index_stack.push(indexs);
            }

        }

        Debug.addText(["count", count]);
        if(count > 100000){
            index_stack;
        }

    }

    //画面初期化
    _clearScreen(gameInfo){
        const context = this.renderingTarget.getContext("2d");
        const w = gameInfo.w;
        const h = gameInfo.h;

        //透明色だけフレーム考慮
        const colors = new Color();
        colors.setRGBfromStr(this.backgroundColor);
        //const colors = this.backgroundColor.match(/\d+(?:\.\d+)?/g);
        //console.log(colors, this.backgroundColor);
        if (colors.a < 1) colors.a *= gameInfo.delta;
        
        const color = "rgba(" + colors.r + ", " + colors.g + ", " + colors.b + ", " + colors.a + ")";

        context.save();
        context.globalCompositeOperation = this.bgRenderMode;
        context.fillStyle = color;
        context.fillRect(0, 0, w, h);
        context.restore();
    }

    //全描写
    _renderAll(){
        this.gameObjs.forEach((obj) => {
            if (obj.enable && obj.visible){
                obj.render(this.renderingTarget);
            }
        });
    }
}


//ゲームクラス
//TODO: コンストラクタにシーンを指定で初期画面設定を可能に
class Game{
    constructor(title, width, height, maxFps, scale = 1){
        this.gameInfo = new GameInfo(title, width, height, maxFps, 0)

        this.screenCanvas = document.createElement("canvas");
        this.screenCanvas.width = width * scale;
        this.screenCanvas.height = height * scale;
        const context = this.screenCanvas.getContext("2d");
        context.scale(scale, scale);

        this._inputReceiver = new InputReceiver(this.screenCanvas);
        this._prevTimestamp = 0;

        this.currentScene = undefined;

        this.debug = true;  //デバッグフラグ

        this.pause = false;
        window.addEventListener("blur", () => this.pause=true);
        window.addEventListener("focus", () => this.pause=false);
        
    }

    changeScene(newScene, args = {}){
        newScene.setArgs(args);
        this.currentScene = newScene;
        this.currentScene.removeEventListener("changescene");
        this.currentScene.addEventListener("changescene", (e) =>
             this.changeScene(e.target));
    }

    //elementタグに追加する形でスタート
    start(element){
        requestAnimationFrame(this._loop.bind(this));
        element.appendChild(this.screenCanvas);
    }

    //メインループ
    _loop(timestamp){
        const elapsedSec = timestamp - this._prevTimestamp;
        if(!this.pause){
            this.gameInfo.currentFps = 1000 / elapsedSec;
            Debug.addText(["FPS", this.gameInfo.currentFps.toFixed()]);
            //this.gameInfo.currentFps = 75;
            this.gameInfo.timeCount += 1;

            //インプット
            const input = this._inputReceiver.getInput();
            
            this.currentScene.update(this.gameInfo, input);

            //デバッグ用
            if (this.debug) Debug.render();
        }

        this._prevTimestamp = timestamp;
        requestAnimationFrame(this._loop.bind(this));
    }
}