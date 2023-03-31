//スプライトクラス
//img：assets.getより入手
//rect：切り抜き用
export default class Sprite {
    //矩形情報は切り抜き用
    constructor(img, rect) {
        this.image = img;
        this.rect = rect;
    }
}
