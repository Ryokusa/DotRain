import GameObject from "./GameObject";

//スプライトオブジェクト
//x,y：座標
//sprite：Spriteクラス
export default class SpriteObject extends GameObject {
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