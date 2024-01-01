import { Actor, CollisionType, Engine } from "excalibur";
import { CosmicBody } from "../actors/cosmic-body";
import { Ship } from "../actors/ship";
import { random } from "../main";
import { linInt } from "../utils";
import { TickableController } from "./tickable-controller";

export class HunterAI extends TickableController {
  #target?: Actor | null;

  #accelerate = false;
  #boost = false;

  #nearestObstacles = new Set<Actor>();

  #trigger: Actor;
  #triggerRadius = 40;

  #health = 100;

  /** For returning on this pos after purcuit finishes */
  // #lastIdlePos = vec(0, 0);

  get isPirate(): boolean {
    return true;
  }

  constructor() {
    super({ ticksInterval: 200 });

    this.#trigger = new Actor({
      radius: this.#triggerRadius,
      collisionType: CollisionType.Passive,
    });
  }

  onInitialize(_engine: Engine, _ship: Ship): void {
    super.onInitialize(_engine, _ship);

    _ship.addChild(this.#trigger);

    this.#trigger.on("collisionstart", (e) => {
      if (e.other instanceof CosmicBody && e.other !== _ship) {
        this.#nearestObstacles.add(e.other);
      }
    });

    this.#trigger.on("collisionend", (e) => {
      if (e.other instanceof CosmicBody) {
        this.#nearestObstacles.delete(e.other);
      }
    });
  }

  onTick(_engine: Engine, _ship: Ship) {
    if (!this.#target || this.#target.isKilled()) {
      this.#target = null;
    }

    if (this.#target) {
      this.#chasing(_ship, this.#target);
    } else {
      this.#idling(_ship);
    }
  }

  #idling(_ship: Ship) {
    if (_ship.speed > 30) {
      _ship.rotateSet(_ship.vel.toAngle() + Math.PI);
      this.#accelerate = true;
    } else {
      this.#accelerate = false;
    }

    this.#boost = false;
  }

  #chasing(_ship: Ship, _target: Actor) {
    const distance = _ship.pos.distance(_target.pos);

    this.#accelerate = distance > 200;
    this.#boost = distance > 300;

    _ship.speedMultiplier = linInt(distance, 400, 800, 1, 1.2);

    const dice = distance < 200 ? random.d20() : random.d10();
    if (distance < 300 && dice === 1) {
      _ship.fire();
    }

    if (distance > 100) {
      _ship.rotateTo(_target.pos.add(_target.vel.sub(_ship.vel)));
    } else {
      _ship.rotateTo(_target.pos);
    }
  }

  onUpdate(_engine: Engine, _delta: number, _ship: Ship): void {
    if (this.#accelerate) {
      _ship.accelerate();
      _ship.boost(this.#boost);
    }

    this.#nearestObstacles.forEach((obstacle) => {
      const direction = _ship.pos.sub(obstacle.pos).toAngle();
      const multiplier = linInt(
        _ship.pos.distance(obstacle.pos),
        0,
        this.#triggerRadius,
        0.005,
        0.001
      );
      _ship.addMotion(Math.max(_ship.speed, 7) * multiplier, direction, _delta);
    });
  }

  onTakeDamage(
    _ship: Ship,
    _amount: number,
    _angle: number,
    _source?: Actor
  ): void {
    if (_source) {
      const newTarget = !this.#target || random.d10() === 1 ? _source : null;
      if (newTarget) this.#target = newTarget;
    }

    const rotation = random.floating(0.5, 1.5);
    _ship.rotate(random.pickOne([-rotation, rotation]), true);

    this.#health -= _amount;
    if (this.#health <= 0) {
      _ship.destroy();
    }
  }
}
