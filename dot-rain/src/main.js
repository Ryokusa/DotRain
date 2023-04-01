import { assets } from "./engine/engine";
import * as Debug from "./engine/Debug";
import MainGame from "./MainGame";
import { setMainGame } from "./Global";

console.log("main")

//ゲーム開始
Debug.setDebugElement(document.getElementById("debug"));
//アセットダウンロード
assets.addImage("menu", "img/menu.png");
assets.addImage("player", "img/p.png");
assets.addImage("score", "img/SCOREs.png");
for (let i = 0; i < 10; i++){
    assets.addImage("s"+i, "img/number/" + i + "s.png")
}

assets.loadAll().then((a) => {
    const mainGame = new MainGame()
    setMainGame(mainGame)
    mainGame.start(document.getElementById("game"));
    console.log("loaded");
}).catch((e) => {
    const msg = `アセットが読み込めませんでした：${e}`
    console.error(msg)
    alert(msg)
})
