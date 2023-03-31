import EventDispatcher from "../EventDispatcher";

//アニメーション
//直線移動などのオブジェ
export default class Animation extends EventDispatcher{
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