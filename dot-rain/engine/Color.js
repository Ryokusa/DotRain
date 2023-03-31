//汎用色クラス
//キーワード&16進数&rgba表記
export default class Color{
    constructor(){
        //基本色
        this.colors = {black:"#000000", gray:"#808080", silver:"C0C0C0", white:"#FFFFFF", blue:"#0000FF", navy:"#000080", teal:"#008080", green:"#008000", lime:"#00FF00", aqua:"#00FFFF", yellow:"FFFF00", red:"#FF0000", fuchsia:"#FF00FF", olive:"#808000", purple:"#800080", maroon:"#800000"};
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 1;
    }

    setRGB(r, g, b){
        this.r = r;
        this.g = g;
        this.b = b
    }

    //文字から色を取得
    setRGBfromStr(s){
        //基本色があるなら取得
        if(this.colors[s]) s = this.colors[s];
        
        //16進数
        if(s[0] == '#'){
            let x = [];
            for (let i = 0; i < 6; i+=2){
                x[i/2] = parseInt(s.slice(i+1,i+3), 16);
            }
            [this.r, this.g, this.b] = x;
            this.a = 1;
            return;
        }

        //数値が3つ以上ある場合
        const color = s.match(/\d+(?:\.\d+)?/g)
        if (color.length >= 3){
            this.r = parseInt(color[0]);
            this.g = parseInt(color[1]);
            this.b = parseInt(color[2]);
        }
        if (color.length == 4) this.a = parseFloat(color[3]);
        else this.a = 1
    }
}