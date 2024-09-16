import { _decorator, Component, Node, RigidBody, Vec3 } from 'cc';
import { SingletonGlobal } from './globals/SingletonGlobal';
import { player } from './PlayerSet';
const { ccclass, property } = _decorator;

@ccclass('PlayerCamera')
export class PlayerCamera extends Component {
    private Global: SingletonGlobal;

    player: player;

    rigidBody: RigidBody;

    @property(Node)
    myPlayer: Node;

    onLoad() {
        this.Global = SingletonGlobal.getInstance();
        this.rigidBody = this.getComponent(RigidBody);
        if (this.rigidBody) {
            this.rigidBody.type = RigidBody.Type.DYNAMIC;
            console.log("刚体类型已设置为：", this.rigidBody.type);
        } else {
            console.error("未能获取到 RigidBody 组件！");
        }
    }
    protected start(): void {
        this.rigidBody.linearFactor = new Vec3(1, 1, 1);  // X、Y、Z 轴上都允许移动
        this.rigidBody.angularFactor = new Vec3(0, 0, 0);
        this.rigidBody.linearDamping = 0;  // 保持阻尼为 0 或很小
        this.rigidBody.useGravity = false;
    }
    update(dt: number) {
        this.setcamera();


    }

    setcamera(smoothSpeedY: number = 0, isYAxisOnly: boolean = false) {
        console.log("设置后的刚体类型：", this.rigidBody.type);

        let cameraPosition = this.node.getWorldPosition();
        let currentPosition = this.myPlayer.getWorldPosition();

        let cameraHightX: number = 0;
        let cameraHightY: number = -10;
        let cameraHightZ: number = 22;

        let targetWithOffset = new Vec3(
            currentPosition.x + cameraHightX,
            currentPosition.y - cameraHightY,
            currentPosition.z - cameraHightZ
        );

        let smoothSpeedX: number = 0.04;
        let smoothSpeedZ: number = 1;
        let newX = cameraPosition.x + (targetWithOffset.x - cameraPosition.x) * smoothSpeedX;
        let newY = cameraPosition.y + (targetWithOffset.y - cameraPosition.y) * smoothSpeedY;
        let newZ = cameraPosition.z + (targetWithOffset.z - cameraPosition.z) * smoothSpeedZ;

        let offsetx = Math.abs(targetWithOffset.x - cameraPosition.x);
        let offsetz = Math.abs(targetWithOffset.z - cameraPosition.z);
        if (offsetx > 3 || offsetz > 0) {
            if (isYAxisOnly) {
                this.node.setWorldPosition(newX, newY, newZ);
            } else {
                this.node.setWorldPosition(newX, 10, cameraHightZ);
            }
        }
        let currentVelocity = new Vec3();

        // 获取物体的线性速度
        this.rigidBody.getLinearVelocity(currentVelocity);

        // 设置目标速度
        let targetVelocity = new Vec3(0, 0, this.Global.Force);

        // 设置新的速度
        this.rigidBody.setLinearVelocity(targetVelocity);
        // console.log(this.node, this.rigidBody, "Current velocity:", this.rigidBody.getLinearVelocity(new Vec3()));

        console.log("设置后的速度：", targetVelocity);
        console.log("刚体类型：", this.rigidBody.type);
        console.log(this.rigidBody.getLinearVelocity(currentVelocity));
        
    }

}

