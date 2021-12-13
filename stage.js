"use strict"
//ステージインフォ（作成中）
class StageInfo {
    constructor(mode, g, resistance){
        this.mode = mode;
        this.g = g;
        this.resistance = resistance;    //空気抵抗
    }
}

//ステージ情報
class Stage{
    constructor(player, dotGroup){
       //ここにステージ情報を入れる
       this.gameObjs = [];
       this.enemyGroup = [];
    }

    add(gameObj){
        this.gameObjs.push(gameObj);
    }
}

class Stage1 extends Stage{
    constructor(player, dotGroup){
        super(dotGroup);
        let enemyGroup = new EnemyGroup(dotGroup);
        //敵試作
        const n = EnemyPart.Type.normal;
        const o = EnemyPart.Type.None;
        const r = EnemyPart.Type.red;
        const b = EnemyPart.Type.battery;
        
        
        const enemyMap = [[r, r, r, r, n, n, n, n, n, r, r, r, r, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
                          [n, n, n, r, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
                          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
                          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
                          [n, n, n, n, b, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
                          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
                          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
                          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n],
                          [n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n, n]];
        const enemy = new Enemy(player, dotGroup, 10, 10, 10, 10, new EnemyMap(enemyMap));
        enemy.addXAnim(new LinearAnimation(10, 100, 100));
        enemy.addXAnim(new LinearAnimation(100, 10, 100));
        enemy.addXAnim(new LinearAnimation(10, 100, 100));
        enemy.addXAnim(new LinearAnimation(100, 10, 100));
        enemy.animStart();
        

        
       //const enemyMap = [[n, n, n]]
        //const enemy = new Enemy(dotGroup, 10, 10, 10, 10, new EnemyMap(enemyMap));
        
        
        enemyGroup.addChild(enemy);
        this.add(enemyGroup)
        this.enemyGroup = enemyGroup;

        //負荷実験
        /*
        for (let i = 0; i < 2000; i++){
            dotGroup.addChild(new PointDot(100, 100, 0, 0));
        }
        */
        
        
    }
}