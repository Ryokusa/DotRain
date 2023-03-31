//矩形クラス
export default class Rectangle {
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