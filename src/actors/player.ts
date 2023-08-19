import {
  Actor,
  CollisionType,
  Color,
  Engine,
  Keys,
  ParticleEmitter,
  PointerEvent,
  PolygonCollider,
  Vector,
  vec,
} from "excalibur";
import { Resources } from "../resources";
import { Asteroid } from "./asteroid";

const trianglePoints = [vec(15, 0), vec(-5, 12), vec(-5, -12)];

export class Player extends Actor {
  #lastCursorPos: Vector = vec(0, 0);
  #controllType: "keyboard" | "mouse" = "keyboard";
  #accelerated: boolean = false;
  #debreeEmitter: ParticleEmitter;

  constructor() {
    super({
      pos: vec(150, 150),
      width: 32,
      height: 32,
      color: Color.Orange,
      collider: new PolygonCollider({ points: trianglePoints }),
      collisionType: CollisionType.Passive,
    });

    this.#debreeEmitter = new ParticleEmitter({
      minVel: 10,
      maxVel: 30,
      minSize: 1,
      maxSize: 3,
      emitRate: 30,
      maxAngle: Math.PI * 2,
      opacity: 0.75,
      isEmitting: false,
    });
  }

  onInitialize(engine: Engine): void {
    // this.graphics.use(new Polygon({points: trianglePoints}))
    this.graphics.use(Resources.Ship.toSprite());
    engine.input.pointers.on("move", (e) => this.#onPointerMove(e));
    this.on("precollision", (event) => {
      // TODO - сейчас сила отбрасывания вычисляется только из текущей скорости
      // объекта. Соответственно, если он стоит, его ничего не может сдвинуть.
      // Нужно складывать (или вычитать) скорости обоих тел, с учетом массы,
      // и уже этот результат применять на объект
      // TODO - Дублирование кода коллизии.
      if (event.other instanceof Asteroid) {
        this.#debreeEmitter.isEmitting = true;

        const asteroid = event.other;

        const direction = this.pos.sub(asteroid.pos);
        const speed = this.vel.distance();
        const force = direction.scale(speed * 0.008);

        this.vel = this.vel.add(force);

        asteroid.vel = asteroid.vel.add(force.scale(-1 / asteroid.getMass()));

        this.#debreeEmitter.pos = this.pos.add(direction.scale(-0.5));
      }
    });

    this.on("collisionend", (event) => {
      this.#debreeEmitter.isEmitting = false;
    });

    const emitter = new ParticleEmitter({
      minVel: 20,
      maxVel: 60,
      minSize: 1,
      maxSize: 3,
      emitRate: 50,
      maxAngle: Math.PI * 2,
      opacity: 0.75,
      particleLife: 1000,
    });

    engine.currentScene.add(this.#debreeEmitter);
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
