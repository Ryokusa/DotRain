
let p;
let text = "";
export const setDebugElement = (element) => {
    p = document.createElement("p");
    element.appendChild(p);
}

//["名前", 変数]で表示
export const addText = (...val) => {
    const len = val.length;
    for (let i = 0; i < len; i++){
        text += val[i][0] + ":" + val[i][1] + "\t";
    }
    text += "<br>";
}

export const render = () => {
    p.innerHTML = text;
    text = "";
}
