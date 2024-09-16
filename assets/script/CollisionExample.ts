import { _decorator, Collider, Component, director, find, Node, PhysicsMaterial, RigidBody, SkeletalAnimation, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import { generativeRoad, SingletonGlobal } from './globals/SingletonGlobal';
import { PlayerCamera } from './PlayerCamera';
import { player } from './PlayerSet';
@ccclass('CollisionExample')
export class CollisionExample extends Component {
    private Global: SingletonGlobal;
    @property(Node)
    private myCamera: Node;
    mapParent: Node;
    digitalMarkup: number = 1;
    generativeroad: any;
    rigidBody: any;
    @property(Node)
    gameOver: Node = null;
    private animState: any;
    skeletalAnimation: SkeletalAnimation;
    collider: Collider;
    bool: Boolean = false;
    Player: player;
    onLoad() {
        // 确保绑定了 Rigidbody 组件
        if (!this.rigidBody) {
            this.rigidBody = this.getComponent(RigidBody);
        }
        // 监听碰撞事件
        this.collider = this.getComponent(Collider);
        if (this.collider) {
            this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
        }
    }
    start(): void {
        this.Player = this.getComponent(player);
        this.Global = SingletonGlobal.getInstance();
        this.generativeroad = generativeRoad.getInstance();
        this.skeletalAnimation = this.getComponent(SkeletalAnimation);
        this.animState = this.skeletalAnimation.getState('Take 001');
        this.Global.gameover = this.gameOver;

    }
    protected update(dt: number): void {
        if (this.bool) {
            let playerPosition = this.node.getWorldPosition();
            let PlayerVec3 = this.Player.savePlayerVec3;
            let offsetx = Math.abs(playerPosition.x - PlayerVec3.x);
            if (offsetx < 0.1) {
                this.Player.stopMovement();
                this.Player.setRoadName();
                this.Player.ismoving = false;
                this.bool = false;
            }
        }
    }
    // 碰撞开始时触发
    onCollisionEnter(event) {
        // 创建一个 Vec3 对象来存储速度
        let currentVelocity = new Vec3();
        // 获取当前的速度
        this.rigidBody.getLinearVelocity(currentVelocity);
        if (this.Global) this.Global.jump = false;
        this.setAnimation();
        if (!this.rigidBody.group || !event.otherCollider.node.getComponent(RigidBody) || !event.otherCollider.node.getComponent(RigidBody).group) return;
        let group = event.otherCollider.node.getComponent(RigidBody).group;
        if (group == 2) {
            if (this.Player.ismoving) {
                let name = this.Player.cloneName;
                
                this.Player.setRoadName(name);
                this.bool = true;
            }
            this.getComponent(SkeletalAnimation).pause();

            setTimeout(() => {
                if (currentVelocity.z < 10) {
                    this.gameover();
                } else {
                    this.getComponent(SkeletalAnimation).play();
                }
            }, 300);

        } else if (group == 1) {
            this.Global.floor = event.otherCollider.node;
            this.setFloorCamera();
        } else if (group == 4) {
            this.gameover();

        }
        console.log(group);

    }

    gameover() {
        this.Global.GameOverFunction();
    }

    setAnimation() {
        if (this.skeletalAnimation) {
            if (this.animState && this.animState.isPlaying) {
            } else {
                this.getComponent(SkeletalAnimation).play();
            }
        }
    }

    setFloorCamera() {
        console.log();
        // this.getComponent(PlayerCamera).setcamera(0.05, true)
    }

}