//ゲームの基本情報
export default class GameInfo {
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