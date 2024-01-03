import { Actor, Engine, Vector } from "excalibur";
import { Ship } from "../actors/ship";
import { game, random } from "../main";
import { SpaceScene } from "../scenes/space";
import { angleDiff, clamp, degToRad, linInt, radToDeg } from "../utils";
import { TickableController } from "./tickable-controller";

export class OldEnemyAI extends TickableController {
  #behavior: "idle" | "purcuit" | "hit" | "damaged" = "idle";
  #steps = 0;

  #purcuitDistance = 350;
  #spottedDistance = 350;

  #chasingTarget?: Actor;
  #targetDistance = 0;
  #targetAngle = 0;

  /** In Degree */
  #maxRotSpeed = 5;

  #ableToShoot = true;
  #targetSpotted = false;
  #canBeIdle = true;
  // #damaged = false;

  get isPirate(): boolean {
    return true;
  }

  constructor() {
    super({ ticksInterval: 700 });
  }

  onInitialize(_engine: Engine, _ship: Ship): void {
    super.onInitialize(_engine, _ship);

    this.#chasingTarget = (_engine.currentScene as SpaceScene)?.player;
    _ship.static = true;
  }

  onTakeDamage(_ship: Ship, _amount: number, _angle: number): void {
    _ship.vel = _ship.vel.rotate(
      degToRad(random.integer(5, 25) * random.pickOne([1, -1]))
    );
    _ship.vel = _ship.vel.sub(_ship.vel.scale(linInt(_amount, 0, 50, 0, 0.1)));
    _ship.rotation = _ship.vel.toAngle();

    this.#behavior = "hit";
    game.clock.schedule(() => {
      if (this.#behavior === "hit") {
        this.#behavior = "purcuit";
      }
    }, 1000);
  }

  onTick(_engine: Engine, _ship: Ship): void {
    if (this.#behavior === "damaged" || !this.#chasingTarget) {
      return;
    }

    this.#targetDistance = _ship.pos.distance(this.#chasingTarget.pos);
    this.#targetAngle = this.#chasingTarget.pos.sub(_ship.pos).toAngle();

    if (this.#targetDistance > 4000) {
      _ship.kill();
      return;
    }

    const maxDistance = this.#targetSpotted
      ? this.#purcuitDistance
      : this.#spottedDistance;

    if (this.#behavior !== "hit") {
      if (this.#targetDistance < maxDistance || !this.#canBeIdle) {
        this.#behavior = "purcuit";
      } else {
        this.#behavior = "idle";
        this.#targetSpotted = false;
        this.#canBeIdle = true;
      }
    } else if (this.#targetDistance > maxDistance && this.#canBeIdle) {
      this.#behavior = "idle";
      this.#targetSpotted = false;
      this.#canBeIdle = true;
    }

    if (this.#behavior === "purcuit" && !this.#targetSpotted) {
      this.#targetSpotted = true;
      this.#canBeIdle = false;

      _engine.clock.schedule(() => {
        this.#canBeIdle = true;
      }, 5000);
    }
  }

  onPostUpdate(_engine: Engine, _delta: number, _ship: Ship): void {
    this.#steps++;

    if (!this.#chasingTarget) return;

    const speed = _ship.vel.distance();
    const targetSpeed = this.#chasingTarget.vel.distance();

    switch (this.#behavior) {
      case "idle": {
        _ship.vel = _ship.vel.scale(0.95);

        break;
      }

      case "purcuit": {
        const angle = angleDiff(this.#targetAngle, _ship.rotation);

        let maxSpeed = 0;
        if (this.#targetDistance > 200) {
          maxSpeed = targetSpeed * 1.15;
        } else if (this.#targetDistance < 120) {
          maxSpeed = targetSpeed * 1.5;
        } else {
          maxSpeed = targetSpeed * 0.95;
        }

        const rotationSpeed = linInt(speed, 0, maxSpeed, 2, this.#maxRotSpeed);

        const direction =
          _ship.vel.toAngle() -
          Math.min(Math.abs(angle), degToRad(rotationSpeed)) * Math.sign(angle);

        const desireSpeed = clamp(
          linInt(
            radToDeg(Math.abs(angle)),
            10,
            180,
            targetSpeed > 200 ? maxSpeed : 210,
            0.5
          ),
          0,
          1500
        );

        const newSpeed = speed + (desireSpeed - speed) / 20;

        _ship.vel = Vector.fromAngle(direction).scale(newSpeed);
        _ship.rotation = direction;

        if (Math.abs(angle) < 30 && this.#targetDistance > 150) {
          this.#tryShootTarget(_ship);
        }

        break;
      }

      case "hit": {
        break;
      }

      case "damaged": {
        _ship.vel = _ship.vel.scale(0.99);

        break;
      }
    }
  }

  #tryShootTarget(_ship: Ship) {
    if (
      !this.#chasingTarget ||
      !this.#ableToShoot ||
      this.#behavior !== "purcuit" ||
      this.#steps % 20 !== 0 ||
      random.integer(0, 5) !== 0
    ) {
      return;
    }

    // if raycast to player is false - return

    _ship.fire();
  }
}
