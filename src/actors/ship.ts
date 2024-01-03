import {
  Actor,
  Color,
  Engine,
  PolygonCollider,
  Sprite,
  Vector,
  vec,
} from "excalibur";
import { DummyController } from "../controllers/dummy-controller";
import { ShipController } from "../controllers/ship-controller";
import { Animations, Resources } from "../resources";
import { angleDiff, linInt, radToDeg } from "../utils";
import { Bullet } from "./bullet";
import { CosmicBody } from "./cosmic-body";
import { Explosion } from "./explosion";

const SHIP_COLLIDER_POINTS = [vec(18, 0), vec(-11, 15), vec(-11, -15)];

export class Ship extends CosmicBody {
  #accelerated = false;
  #boosted = false;

  #maxSpeed = 500;
  #burstEdge = 200;

  #speedMultiplier = 1;
  #boostMultiplier = 1.2;

  #jetsGraphics = Animations.JetStream;

  #rotateTo: number;
  #rotationMoment = 0.1;

  static = false;

  #controller: ShipController;
  #shipSprite: Sprite;

  get controller() {
    return this.#controller;
  }

  #lastSpeed = 0;

  get speed() {
    return this.#lastSpeed;
  }

  get accelerated() {
    return this.#accelerated;
  }

  get speedMultiplier() {
    return this.#speedMultiplier;
  }

  set speedMultiplier(value: number) {
    this.#speedMultiplier = value;
  }

  accelerate(state = true) {
    this.#accelerated = state;
  }

  get boosted() {
    return this.#boosted;
  }

  boost(state = true) {
    this.#boosted = state;
  }

  constructor(parameters: {
    pos?: Vector;
    colliderScale?: number;
    controller?: ShipController;
    shipSprite?: Sprite;
    name?: string;
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
      name: parameters.name || "Ship",
    });

    this.#shipSprite =
      parameters.shipSprite ?? Resources.Ship.Player.Default.toSprite();
    this.#controller = parameters?.controller ?? new DummyController();
    this.#rotateTo = this.rotation;
  }

  onInitialize(_engine: Engine): void {
    super.onInitialize(_engine);

    this.graphics.use(this.#shipSprite);
    this.graphics.add(this.#jetsGraphics);

    this.on("collisionstart", (e) => {
      const other = e.other;
      if (!(other instanceof CosmicBody)) return;

      const relativeSpeed = Math.abs(other.vel.sub(this.vel).distance());

      const damageBound = 80;

      if (relativeSpeed > damageBound) {
        this.takeDamage(
          (relativeSpeed - damageBound) * (other.mass / this.mass) * 0.1,
          other.pos.sub(this.pos).toAngle(),
          other
        );
      }
    });

    this.#controller.onInitialize(_engine, this);
  }

  onPreUpdate(_engine: Engine, _delta: number): void {
    super.onPreUpdate(_engine, _delta);

    this.#controller.onPreUpdate(_engine, _delta, this);
  }

  onPostUpdate(_engine: Engine, _delta: number): void {
    super.onPostUpdate(_engine, _delta);

    this.#controller.onPostUpdate(_engine, _delta, this);

    if (!this.static) {
      this.#updateRotation(_delta);
      this.#updateMotion(_delta);
      this.#updateVisuals();
    }

    this.accelerate(false);
    this.boost(false);
  }

  takeDamage(_amount: number, _angle: number, _source?: Actor): void {
    super.takeDamage(_amount, _angle, _source);

    this.addMotion(linInt(this.speed, 50, 400, 20, 100), _angle - Math.PI);

    this.controller.onTakeDamage(this, _amount, _angle, _source);
    this.scene.add(new Explosion(this.pos));
  }

  fire() {
    if (!this.scene) return;

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

  rotateSet(angle: number, instant = false) {
    this.#rotateTo = angle;

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
      const speedMultiplier =
        this.#speedMultiplier * (this.#boosted ? this.#boostMultiplier : 1);

      const acceleration =
        speed < this.#burstEdge
          ? linInt(speed, 0, this.#burstEdge, 0.2, 0.05)
          : linInt(
              speed,
              this.#burstEdge,
              this.#maxSpeed * speedMultiplier,
              0.05,
              0.01
            );

      this.addMotion(acceleration * speedMultiplier, this.rotation, _delta);

      const drifting = Math.abs(
        radToDeg(angleDiff(this.rotation, this.vel.toAngle()))
      );

      if (drifting > 100) {
        const driftAcceleration = linInt(drifting, 45, 180, 0, 0.3);
        this.addMotion(
          driftAcceleration * speedMultiplier,
          this.rotation,
          _delta
        );
      }

      this.vel = this.vel.clampMagnitude(this.#maxSpeed * speedMultiplier);
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

  #updateVisuals() {
    if (this.static) {
      this.#jetsGraphics.opacity = this.vel.squareDistance() > 0 ? 1 : 0;
    } else {
      this.#jetsGraphics.opacity = this.accelerated ? 1 : 0;
    }
  }
}
