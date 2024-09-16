import { _decorator, Camera, Collider, Component, PhysicsMaterial, Prefab, RigidBody, SkeletalAnimation, Vec3, Node, BoxCollider, UITransform, tween, log, director, PhysicsSystem } from 'cc';
import { SingletonGlobal, generativeRoad, obstacleManager } from './globals/SingletonGlobal';
const { ccclass, property } = _decorator;

@ccclass('player')
export class player extends Component {
    @property(Prefab)
    private roadsPrefab: Prefab;
    @property(Node)
    private myroadNode: Node;
    @property(Node)
    private myCamera: Node;

    @property(Prefab)
    prefab1: Prefab;
    @property(Prefab)
    prefab2: Prefab;
    @property(Prefab)
    prefab3: Prefab;
    @property(Prefab)
    prefab4: Prefab;

    private recoveryCallback: Function = null;
    private obstaclemanager: obstacleManager
    private Global: SingletonGlobal;
    private generativeroad: generativeRoad;
    private animSpeed: number = 0.8;
    private rigidBody: RigidBody;
    private jumpHight: number;
    private thisroadName: String;
    private isMoving: Boolean = false;
    private currentRoad;
    private switchPlaces = 10000;
    public savePlayerVec3: Vec3;
    public cloneName: String;
    private cameraRigidBody:RigidBody;
    start() {
        if (!this.rigidBody) {
            this.rigidBody = this.getComponent(RigidBody);
        }
        this.cameraRigidBody = this.myCamera.getComponent(RigidBody)
        this.Global = SingletonGlobal.getInstance();
        this.generativeroad = generativeRoad.getInstance();
        this.obstaclemanager = obstacleManager.getInstance();
        let prefab = [this.prefab1, this.prefab2, this.prefab3, this.prefab4]
        this.obstaclemanager.setobstaclePrefab(prefab)
        this.generativeroad.initSetRoad(this.roadsPrefab, 4, this.node.worldPosition, this.myroadNode);
        this.initRoadName();
        let that = this;
        this.runStart();
        let time = function () {
            setTimeout(() => {
                that.Global.ForceAdd1();
                that.animSpeed += 0.001;
                if (that.rigidBody) {
                    that.runStart();
                }
                time();
            }, 3000);
        }
        time();


        let cycle = function () {
            setTimeout(() => {
                if (that.node.worldPosition.z > that.generativeroad.currentroad[1].worldPosition.z) {
                    if (that.generativeroad) {
                        that.generativeroad.setRoads();
                        //不断更新当前所在的位置
                        that.currentRoad = that.generativeroad.currentroad[0];
                    }
                }
                cycle();
            }, 500);
        }
        cycle();

        // 确保重力影响正常
        this.rigidBody.useGravity = true;
        // 确保角色可以在 Y 轴方向自由移动
        this.rigidBody.linearFactor = new Vec3(1, 1, 1);  // X、Y、Z 轴上都允许移动

    }

    get ismoving() {
        return this.isMoving;
    }
    set ismoving(e) {
        this.isMoving = e;
    }
    get thisRoadName() {
        return this.thisroadName;
    }
    runStart() {
        let currentVelocity = new Vec3(0, 0, this.Global.Force);
        this.LinearVelocity(currentVelocity)

        const skeletalAnimation = this.getComponent(SkeletalAnimation);
        const animState = skeletalAnimation.getState('Take 001');
        animState.speed = this.animSpeed;
    }

    initRoadName() {
        this.thisroadName = 'road';
        this.currentRoad = this.generativeroad.currentroad[0];
        this.setRoadName();
    }

    update(dt) {
        // 每帧在 Z 轴方向施加持续力
        // 使用一个 Vec3 对象来接收当前速度


        if (this.node.position.y > this.jumpHight + 15) {
            this.stopMovement();
            let forceVec = new Vec3(0, 50, 0);
            this.rigidBody.applyImpulse(forceVec, this.rigidBody.node.worldPosition);
        }

        if (this.node.position.y < -8) {
            this.Global.GameOverFunction();
        }

        if (this.isMoving) {
            let currentPosition = this.node.getWorldPosition().x;
            let leftNewPosition = !this.Global.leftR ? null : this.Global.leftR.getWorldPosition().x;
            let rightNewPosition = !this.Global.rightR ? null : this.Global.rightR.getWorldPosition().x;

            let positionGapl = Math.abs(currentPosition - leftNewPosition);
            let positionGapr = Math.abs(currentPosition - rightNewPosition);

            if (positionGapl < 0.3 || positionGapr < 0.3) {
                this.stopMovement();
                this.setRoadName();
                this.isMoving = false;
            }

        }

    }

    setRoadName(name: String = null) {
        if (name) { this.thisroadName = name };
        if (this.thisroadName == 'road') {
            this.Global.leftR = this.currentRoad.children[1];
            this.Global.rightR = this.currentRoad.children[2];
        } else if (this.thisroadName == 'roadLeft') {
            this.Global.leftR = null;
            this.Global.rightR = this.currentRoad.children[0];
        } else if (this.thisroadName == 'roadRight') {
            this.Global.leftR = this.currentRoad.children[0];
            this.Global.rightR = null;
        }
    }

    //施加向左的力
    addLeftMovement() {
        this.turnPackaged(this.Global.leftR, this.switchPlaces);
    }

    //施加向右的力
    addRightMovement() {
        this.turnPackaged(this.Global.rightR, -this.switchPlaces);
    }

    turnPackaged(e, m) {
        if (!e || e.position == null || this.isMoving) return;
        this.isMoving = true;
        this.rigidBody.angularFactor = new Vec3(0, 0, 0);
        this.savePlayerVec3 = this.node.getWorldPosition();
        this.cloneName = this.thisroadName
        this.thisroadName = e.name;
        this.applyForceToRigidbody(m);

    }


    LinearVelocity(f) {
        let currentVelocity = new Vec3();
        this.rigidBody.getLinearVelocity(currentVelocity);
        currentVelocity = f;
        this.rigidBody.setLinearVelocity(currentVelocity);
    }

    //碰撞后的速度恢复，在3秒内恢复到原来的速度
    setTouchForce() {

    }

    applyImpulseToRigidbody(m) {
        let force = new Vec3(m, 0, 0);
        this.rigidBody.applyImpulse(force);
    }

    applyForceToRigidbody(m) {
        let force = new Vec3(m, 0, 0);
        this.rigidBody.applyForce(force);
    }


    jumpMovement() {
        if (this.Global.jump) return;
        if (this.recoveryCallback) {
            this.unschedule(this.recoveryCallback);
        }
        this.recovery(0.1)
        this.playerState('jump');
        this.Global.jump = true;
        this.jumpHight = this.node.position.y;

        this.rigidBody.angularFactor = new Vec3(0, 0, 0);
        this.rigidBody.linearDamping = 0;  // 保持阻尼为 0 或很小
        let jumpImpulse = new Vec3(0, 130, 20);
        this.rigidBody.applyImpulse(jumpImpulse, this.node.worldPosition);
    }


    // 角色状态转换
    playerState(e) {
        if (e == 'jump') {
            this.Global.jump = true;
            this.getComponent(SkeletalAnimation).stop();
        } else if (e == 'run') {
            this.getComponent(SkeletalAnimation).play();
        }
    }

    stopMovement() {
        // 清除物体的速度和角速度，停止运动
        this.rigidBody.clearVelocity();
        this.rigidBody.getAngularVelocity(new Vec3(0, 0, 0));
        let currentVelocity = new Vec3(0, 0, this.Global.Force); // 修改 Z 轴方向速度
        this.LinearVelocity(currentVelocity)
    }

    downForce() {
        // 保存匿名函数的引用
        this.recoveryCallback = () => {
            this.recovery(0.5);
        };
        let Force = new Vec3(0, 0, 0);
        this.rigidBody.applyImpulse(Force, this.node.worldPosition);
        tween(this.node.parent)
            .to(0.2, { scale: new Vec3(1, 0.3, 1) }, { easing: 'sineOut' })  // 在0.5秒内缩小
            .start();
        this.scheduleOnce(this.recoveryCallback, 1.5);
    }

    recovery(e) {
        tween(this.node.parent)
            .to(e, { scale: new Vec3(1, 1, 1) }, { easing: 'sineOut' })  // 在0.5秒内恢复
            .start();
    }

    touch() {
        let Force = new Vec3(0, 0, -100);
        this.rigidBody.applyImpulse(Force, this.node.worldPosition);
    }
}

