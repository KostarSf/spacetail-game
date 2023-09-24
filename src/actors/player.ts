import {
  CollisionGroupManager,
  Color,
  Engine,
  Keys,
  PointerEvent,
  PolygonCollider,
  Vector,
  vec,
} from "excalibur";
import { Resources } from "../resources";
import CosmicBody from "./CosmicBody";
import { Bullet } from "./bullet";

const trianglePoints = [vec(15, 0), vec(-5, 12), vec(-5, -12)];

export class Player extends CosmicBody {
  #lastCursorPos: Vector = vec(0, 0);
  #controllType: "keyboard" | "mouse" = "keyboard";
  #accelerated: boolean = false;

  constructor() {
    super(10, {
      pos: vec(150, 150),
      width: 32,
      height: 32,
      color: Color.Orange,
      collider: new PolygonCollider({ points: trianglePoints }),
    });
  }

  onInitialize(_engine: Engine): void {
    super.onInitialize(_engine);

    // this.graphics.use(new Polygon({points: trianglePoints}))
    this.graphics.use(Resources.Ship.toSprite());
    _engine.input.pointers.on("move", (e) => this.#onPointerMove(e));

    this.on("precollision", () => {
      _engine.currentScene.camera.shake(4, 4, 100);
    });

    _engine.input.pointers.primary.on("down", () => {
      _engine.currentScene.add(
        new Bullet(this, Vector.fromAngle(this.rotation).scale(16))
      );
    });
  }

  #onPointerMove(e: PointerEvent) {
    this.#lastCursorPos = e.screenPos;
    this.#controllType = "mouse";
  }

  onPostUpdate(engine: Engine, delta: number): void {
    const cursorWorldPos = engine.screenToWorldCoordinates(this.#lastCursorPos);

    if (this.#controllType === "mouse") {
      this.lookTo(cursorWorldPos);
    }

    if (engine.input.keyboard.isHeld(Keys.W)) {
      this.#accelerate();
    }

    this.applyMovement(delta);

    let rotationMult = 0;
    if (engine.input.keyboard.isHeld(Keys.A)) {
      rotationMult -= 1;
    }

    if (engine.input.keyboard.isHeld(Keys.D)) {
      rotationMult += 1;
    }

    this.rotate(rotationMult * delta * 0.005);
  }

  lookTo(pos: Vector) {
    const direction = pos.sub(this.pos).toAngle();
    this.rotation = direction;
  }

  #accelerate() {
    this.#accelerated = true;
  }

  applyMovement(delta = 1) {
    if (this.#accelerated) {
      Vector.fromAngle(this.rotation);
      this.vel = this.vel.add(
        Vector.fromAngle(this.rotation).scale(0.3 * delta)
      );
    } else {
      const speed = this.vel.distance();
      let velocity = vec(0, 0);

      if (speed > 30) {
        velocity = this.vel.scale(0.995);
      } else if (speed > 0.2) {
        velocity = this.vel.scale(0.98);
      }

      this.vel = velocity;
    }

    this.#accelerated = false;
  }

  rotate(angle: number) {
    if (angle !== 0) {
      this.rotation += angle;
      this.#controllType = "keyboard";
    }
  }
}
