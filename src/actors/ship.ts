import { Color, Engine, PolygonCollider, Vector, vec } from "excalibur";
import { CosmicBody } from "./cosmic-body";
import { Animations, Resources } from "../resources";
import { Bullet } from "./bullet";
import { angleDiff, linInt, radToDeg } from "../utils";
import { ShipController } from "../controllers/ship-controller";
import { Explosion } from "./explosion";

const SHIP_COLLIDER_POINTS = [vec(12, 0), vec(-7, 10), vec(-7, -10)];

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

  #controller?: ShipController;

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

    this.on("collisionstart", (e) => {
      const other = e.other;
      if (!(other instanceof CosmicBody)) return;

      const relativeSpeed = Math.abs(other.vel.sub(this.vel).distance());

      const damageBound = 80;

      if (relativeSpeed > damageBound) {
        this.takeDamage(
          relativeSpeed - damageBound,
          other.pos.sub(this.pos).toAngle()
        );
      }
    });
  }

  onPostUpdate(_engine: Engine, _delta: number): void {
    super.onPostUpdate(_engine, _delta);

    this.#controller?.onUpdate(_engine, _delta, this);

    this.#updateRotation(_delta);
    this.#updateMotion(_delta);
    this.#updateVisuals();

    this.accelerate(false);
    this.boost(false);
  }

  takeDamage(amount: number, angle: number): void {
    this.addMotion(linInt(this.speed, 50, 400, 20, 100), angle - Math.PI);

    this.controller?.onTakeDamage(this, amount, angle);
    this.scene.add(new Explosion(this.pos));
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
    this.#jetsGraphics.opacity = this.accelerated ? 1 : 0;
  }
}
