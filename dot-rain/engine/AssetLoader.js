//アセットローター
export default class AssetLoader {
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