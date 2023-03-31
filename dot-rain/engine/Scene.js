import EventDispatcher from "./EventDispatcher";
import GameEvent from "./GameEvent";
import Color from "./Color";
import * as Debug from "./Debug"
import { getMortonNumber } from "./Utils";

export default class Scene extends EventDispatcher {
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
        insertionSort(a, this.valueCompareFunc);
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
        
        insertionSort(this.x_points, this.valueCompareFunc);
        insertionSort(this.y_points, this.valueCompareFunc);

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
            const index1 = getMortonNumber(parseInt(rect.x / dx), parseInt(rect.y / dy));
            const index2 = getMortonNumber(parseInt((rect.x+rect.w-1) / dx), parseInt((rect.y+rect.h-1) / dy));
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