import Animation from ".";

//直線アニメーション
export default class LinearAnimation extends Animation{
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