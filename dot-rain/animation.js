"use strict"

//アニメーション集合体
//getValueのたびにフレームが進む
class Animator extends EventDispatcher{
    constructor(name){
        super();
        this.animations = []
        this.enable = false;    //再生状態
        this.index = 0;     //アニメーションインデックス
        this.name = name;
    }

    addAnim(anim){
        anim.addEventListener("lastFrame", (e) =>{
            this.index += 1;
            this.dispatchEvent("animNext", this.index);   //次のアニメーション時
        });
        this.animations.push(anim);

        return this;
    }

    getValue(frame){
        //アニメーション中の値を返す
        if (this.enable){
            //終了処理
            if (this.index == this.animations.length){
                this.dispatchEvent("animEnd", this);
                this.reset();
                return undefined;
            }
            return this.animations[this.index].getValue(frame);
        }
        return undefined;
    }

    start(){
        this.enable = true;
    }

    stop(){
        this.enable = false;
    }

    reset(){
        this.index = 0;
        this.enable = false;
        this.animations.forEach((animation) => {
            animation.reset();
        })
    }
}

//アニメーション
//直線移動などのオブジェ
class Animation extends EventDispatcher{
    constructor(start, end, frameNum){
        super();
        this.start = start;
        this.end = end;
        this.frameNum = frameNum;
        this.frame = 0;
    }

    getValue(){

    }

    reset(){
        this.frame = 0;
    }
}

//直線アニメーション
class LinearAnimation extends Animation{
    constructor(start, end, frameNum){
        super(start, end, frameNum);
    }

    getValue(frame){

        const distance = this.end - this.start;
        const result = this.start + distance * (this.frame / this.frameNum);
        this.frame += frame;

        //ラストフレームイベント
        if(this.frame >= this.frameNum){
            this.dispatchEvent("lastFrame", this);
            this.reset();
        }

        return result;
    }
}