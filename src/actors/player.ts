import {
  Color,
  Engine,
  Keys,
  PointerEvent,
  PolygonCollider,
  Vector,
  vec,
} from "excalibur";
import { Animations, Resources } from "../resources";
import { CosmicBody } from "./cosmic-body";
import { Bullet } from "./bullet";
import { angleDiff, linInt, radToDeg } from "../utils";

const trianglePoints = [vec(12, 0), vec(-7, 10), vec(-7, -10)];

export class Player extends CosmicBody {
  #lastCursorPos: Vector = vec(0, 0);
  #controllType: "keyboard" | "mouse" = "keyboard";
  #accelerated: boolean = false;
  #jetsGraphics = Animations.JetStream;

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

    this.graphics.use(Resources.Ship.Player.Default.toSprite());
    this.graphics.add(this.#jetsGraphics);

    _engine.input.pointers.on("move", (e) => this.#onPointerMove(e));

    this.on("precollision", (e) => {
      if (e.other instanceof CosmicBody) {
        _engine.currentScene.camera.shake(4, 4, 100);
      }
    });

    _engine.input.pointers.primary.on("down", () => {
      _engine.currentScene.camera.shake(2, 2, 100);
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
    this.updateVisuals(engine);

    this.#accelerated = false;

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

  addMotion(direction: number, amount: number, delta = 1) {
    this.vel = this.vel.add(Vector.fromAngle(direction).scale(amount * delta));
  }

  applyMovement(delta = 1) {
    const speed = this.vel.distance();

    if (this.#accelerated) {
      const acceleration = speed < 120 ? 0.12 : 0.04;

      this.addMotion(this.rotation, acceleration, delta);

      const drifting = Math.abs(
        radToDeg(angleDiff(this.rotation, this.vel.toAngle()))
      );
      if (drifting > 100) {
        const driftAcceleration = linInt(drifting, 100, 180, 0, 0.1);
        this.addMotion(this.rotation, driftAcceleration, delta);
      }

      this.vel = this.vel.clampMagnitude(500);
    } else {
      let velocity = vec(0, 0);

      if (speed > 100) {
        velocity = this.vel.scale(0.9999);
      } else if (speed > 1) {
        velocity = this.vel.scale(0.997);
      } else {
        velocity = this.vel.scale(0.95);
      }

      this.vel = velocity;
    }
  }

  updateVisuals(engine: Engine) {
    if (this.#accelerated) {
      this.graphics.show(this.#jetsGraphics);

      const shakeMagnitude = 1 + this.vel.squareDistance() * 0.000002;
      engine.currentScene.camera.shake(shakeMagnitude, shakeMagnitude, 50);
    } else {
      this.graphics.hide(this.#jetsGraphics);
    }
  }

  rotate(angle: number) {
    if (angle !== 0) {
      this.rotation += angle;
      this.#controllType = "keyboard";
    }
  }
}
