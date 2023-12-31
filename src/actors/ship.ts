import { Color, Engine, PolygonCollider, Vector, vec } from "excalibur";
import { CosmicBody } from "./cosmic-body";
import { Animations, Resources } from "../resources";
import { Bullet } from "./bullet";
import { angleDiff, linInt, radToDeg } from "../utils";
import { ShipController } from "../controllers/ship-controller";

const SHIP_COLLIDER_POINTS = [vec(12, 0), vec(-7, 10), vec(-7, -10)];

export class Ship extends CosmicBody {
  #accelerated = false;
  #maxSpeed = 500;
  #burstEdge = 200;

  #jetsGraphics = Animations.JetStream;

  #rotateTo: number;
  #rotationMoment = 0.2;

  #controller?: ShipController;

  get controller() {
    return this.#controller;
  }

  #lastSpeed = 0;

  get speed() {
    return this.#lastSpeed;
  }

  constructor(parameters: {
    pos?: Vector;
    colliderScale?: number;
    controller?: ShipController;
  }) {
    super(10, {
      pos: parameters.pos,
      width: 32,
      height: 32,
      color: Color.Orange,
      collider: new PolygonCollider({
        points: SHIP_COLLIDER_POINTS.map((vector) =>
          vector.scale(parameters.colliderScale ?? 1)
        ),
      }),
    });

    this.#controller = parameters.controller;
    this.#rotateTo = this.rotation;
  }

  onInitialize(_engine: Engine): void {
    super.onInitialize(_engine);

    this.#controller?.onInitialize(_engine, this);

    this.graphics.use(Resources.Ship.Player.Default.toSprite());
    this.graphics.add(this.#jetsGraphics);
  }

  onPostUpdate(_engine: Engine, _delta: number): void {
    super.onPostUpdate(_engine, _delta);

    this.#controller?.onUpdate(_engine, _delta, this);

    this.#updateRotation(_delta);
    this.#updateMotion(_delta);
    this.#updateVisuals();

    this.accelerate(false);
  }

  fire() {
    const bulletAnchor = Vector.fromAngle(this.rotation).scale(16);
    const bullet = new Bullet(this, bulletAnchor);

    this.scene.add(bullet);
  }

  rotate(angle: number, instant = false) {
    this.#rotateTo += angle;

    if (instant) {
      this.rotation = this.#rotateTo;
    }
  }

  rotateTo(target: Vector, instant = false) {
    this.#rotateTo = target.sub(this.pos).toAngle();

    if (instant) {
      this.rotation = this.#rotateTo;
    }
  }

  get accelerated() {
    return this.#accelerated;
  }

  accelerate(state = true) {
    this.#accelerated = state;
  }

  #updateRotation(_delta: number) {
    const rotationDifference = angleDiff(this.rotation, this.#rotateTo);
    if (Math.abs(rotationDifference) > 0.01) {
      this.rotation += rotationDifference * this.#rotationMoment;
    } else {
      this.rotation = this.#rotateTo;
    }
  }

  #updateMotion(_delta: number) {
    const speed = this.vel.distance();
    this.#lastSpeed = speed;

    if (this.#accelerated) {
      const acceleration =
        speed < this.#burstEdge
          ? linInt(speed, 0, this.#burstEdge, 0.2, 0.05)
          : linInt(speed, this.#burstEdge, this.#maxSpeed, 0.05, 0.01);

      this.#addMotion(this.rotation, acceleration, _delta);

      const drifting = Math.abs(
        radToDeg(angleDiff(this.rotation, this.vel.toAngle()))
      );

      if (drifting > 100) {
        const driftAcceleration = linInt(drifting, 45, 180, 0, 0.3);
        this.#addMotion(this.rotation, driftAcceleration, _delta);
      }

      this.vel = this.vel.clampMagnitude(this.#maxSpeed);
    } else {
      let multiplier = 0;

      if (speed > 100) {
        multiplier = linInt(speed, 100, this.#maxSpeed, 0.9999, 0.999999);
      } else if (speed > 10) {
        multiplier = linInt(speed, 10, 100, 0.997, 0.9999);
      } else if (speed > 0.01) {
        multiplier = linInt(speed, 0.01, 10, 0.95, 0.997);
      }

      this.vel = this.vel.scale(multiplier);
    }
  }

  #addMotion(direction: number, amount: number, delta = 1) {
    this.vel = this.vel.add(Vector.fromAngle(direction).scale(amount * delta));
  }

  #updateVisuals() {
    this.#jetsGraphics.opacity = this.accelerated ? 1 : 0;
  }
}
