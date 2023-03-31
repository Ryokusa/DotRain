//汎用関数
    //2点の単位ベクトル
export const getUnitVector = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const radian = Math.atan2(dy, dx);
    return {x: Math.cos(radian), y: Math.sin(radian)};
}

export const getDistance = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

//クイックソート関数
export const quickSort = (a, startID,endID) => {
    //範囲の間にある値をピポットに設定する
    var pivot = a[Math.floor((startID + endID)/2)];
    //引数を左端、右端として変数にいれる
    var left = startID;
    var right = endID;

    //ピポットより小さい値を左側へ、大きい値を右側へ分割する
    while(true){
        //leftの値がpivotより小さければleftを一つ右へ移動する
        while(a[left]<pivot){
            left++;
        }
        //rightの値がpivotより小さければrightを一つ左へ移動する
        while(pivot<a[right]){
            right--;
        }
        //leftとrightの値がぶつかったら、そこでグループ分けの処理を止める。
        if(right <= left){
            break;
        }

        //rightとrightの値がぶつかっていない場合、leftとrightを交換
        //交換後にleftを後ろへ、rightを前へ一つ移動する
        const tmp =a[left];
        a[left] =a[right];
        a[right] =tmp;
        left++;
        right--;
    }

    //左側に分割できるデータがある場合、quickSort関数を呼び出して再帰的に処理を繰り返す。
    if(startID < left-1){
        quickSort(a, startID,left-1);
    }
    //右側に分割できるデータがある場合、quickSort関数を呼び出して再帰的に処理を繰り返す。
    if(right+1 < endID){
        quickSort(a, right+1,endID);
    }
}

export const insertionSort = (a, func) => {
    //未整列の部分から値を１つずつ取り出すfor文
    for(let i = 1; i < a.length; i++){
        //「挿入する値」を変数に一時保存する
        const tmp = a[i];

        //「整列済みの部分」のどこに挿入すれば良いか後ろから前に向かって順番に判断する
        for(var j = i-1; j>=0; j--){
            //「挿入する値」が小さい場合、調べた値を１つ後ろへずらす
            if(func(a[j], tmp) > 0){
                a[j+1] = a[j];
            }else{
                //小さくなければ、ずらす処理を止める
                break;
            }
        }
        //ずらす処理が終わったところに「挿入する値」を入れる
        a[j+1] = tmp;
    }
}

//32ビットを開ける11 -> 0101
const bitSeparate32 = (x) => {
    x = (x | x << 8) & 0x00ff00ff;
    x = (x | x << 4) & 0x0f0f0f0f;
    x = (x | x << 2) & 0x33333333;
    x = (x | x << 1) & 0x55555555;
    return x;
}

//モートン空間座標(引数には分割空間の座標)
export const getMortonNumber = (x, y) => {
    return bitSeparate32(x) | (bitSeparate32(y) << 1)
}