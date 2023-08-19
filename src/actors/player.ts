import { Actor, Engine, Keys, Vector, vec, PointerEvent } from "excalibur";
import { Resources } from "../resources";

export class Player extends Actor {
  #lastCursorPos: Vector = vec(0, 0);
  #controllType: "keyboard" | "mouse" = "keyboard";
  #accelerated: boolean = false;

  constructor() {
    super({
      pos: vec(150, 150),
      width: 100,
      height: 100,
    });
  }

  onInitialize(engine: Engine): void {
    this.graphics.use(Resources.Ship.toSprite());
    engine.input.pointers.on("move", (e) => this.#onPointerMove(e));
  }

  #onPointerMove(e: PointerEvent) {
    this.#lastCursorPos = e.worldPos;
    this.#controllType = "mouse";
  }

  onPostUpdate(engine: Engine, delta: number): void {
    if (this.#controllType === "mouse") {
      this.lookTo(this.#lastCursorPos);
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
      let velocity = vec(0, 0)

      if (speed > 30) {
        velocity = this.vel.scale(0.995);
      } else if (speed > 0.2) {
        velocity = this.vel.scale(0.98);
      }

      this.vel = velocity
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
