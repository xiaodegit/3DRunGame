import { _decorator, Vec3, Prefab, instantiate, Node, director } from "cc";

export class SingletonGlobal {
    private static instance: SingletonGlobal;
    private jumpBoolean: Boolean;
    private leftRoad;
    private rightRoad;
    private Floor: Node;
    private over: Node;

    private force: number;

    private constructor() {
        this.jumpBoolean = false;
        this.force = 30;
    }

    public static getInstance(): SingletonGlobal {
        if (!SingletonGlobal.instance) {
            SingletonGlobal.instance = new SingletonGlobal();
        }
        return SingletonGlobal.instance;
    }

    public set jump(e) {
        this.jumpBoolean = e;
    }

    public get jump() {
        return this.jumpBoolean;
    }

    public set leftR(e) {
        this.leftRoad = e;
    }
    public set rightR(e) {
        this.rightRoad = e;
    }
    public get leftR() {
        return this.leftRoad;
    }
    public get rightR() {
        return this.rightRoad;
    }
    public set floor(e) {
        this.Floor = e;
    }
    public get floor() {
        return this.Floor;
    }

    public set gameover(e) {
        this.over = e
    }
    public get Force() {
        return this.force;
    }

    public set Force(e) {
        this.force = e;
    }

    public ForceAdd1(){
        this.force++;
    }
    public GameOverFunction() {
        this.over.active = true;
        return director.pause();
    }
}



export class obstacleManager {
    private static instance: obstacleManager;
    private obstacles = [];

    public static getInstance(): obstacleManager {
        if (!obstacleManager.instance) {
            obstacleManager.instance = new obstacleManager();
        }
        return obstacleManager.instance;
    }

    setobstaclePrefab(prefab) {
        for (let i = 0; i < 4; i++) {
            this.obstacles.push(prefab[i]);
        }
    }

    get segments() {
        return this.obstacles;
    }
}


export class generativeRoad {
    private static instance: generativeRoad;
    obstaclemanager: obstacleManager;

    //生成三个或四个道路
    private currentRoad: Array<Node> = [];//当前道路 把第一个拿出来变成可复用道路
    private multiplexRoad;//可复用道路

    public static getInstance(): generativeRoad {
        if (!generativeRoad.instance) {
            generativeRoad.instance = new generativeRoad();
        }
        return generativeRoad.instance;
    }

    constructor() {
        this.obstaclemanager = obstacleManager.getInstance();
    }

    // 开局初始化并分配所有道路
    initSetRoad(prefab: Prefab, segmentCount: number, isCharacterPosition: Vec3, parentNode: Node) {
        for (let i = 0; i < segmentCount; i++) {
            const segment = instantiate(prefab);
            parentNode.addChild(segment);
            segment.setPosition(0, 0, isCharacterPosition.z + i * 384);
            this.currentRoad.push(segment);
            if (i > 0) {
                this.randomoObstacle(segment);
            }
        }
    }

    setRoads() {
        //玩家每走到第二个道就删掉第一个放入到复用里
        this.multiplexRoad = this.currentRoad[0];
        this.currentRoad.shift();
        this.multiplexRoad.setPosition(0, 0, this.currentRoad[0].worldPosition.z + 1152);
        this.currentRoad.push(this.multiplexRoad);
        let children = this.multiplexRoad.children[3];
        if (children) {
            children.removeAllChildren()
        }
        this.randomoObstacle(this.multiplexRoad);

    }

    //随机分配障碍物
    randomoObstacle(segment) {

        //随机位置 前 中 后 5   0  -5  ,  0  ,  20  0  -20
        let randomx = [5.6, 0, -5.6];
        let randomz = [20, 0, -20];
        let positions: Array<Vec3> = [];

        // 生成所有位置组合
        for (let x of randomx) {
            for (let z of randomz) {
                positions.push(new Vec3(x, 0, z));  // 假设 Y 轴为 0
            }
        }

        // 打乱位置
        function shuffle(array: Array<any>) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        shuffle(positions);
        for (let i = 0; i < 4; i++) {
            let array: Array<Prefab> = this.obstaclemanager.segments;

            if (array) {
                let instantArray = instantiate(array[i]);
                segment.children[3].addChild(instantArray);
                instantArray.setPosition(positions[i]);  // 设置随机位置

            }
        }
    }

    public get currentroad(): Array<Node> {
        return this.currentRoad;
    }
}