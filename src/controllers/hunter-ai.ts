import { Actor, CollisionType, Color, Engine, Trigger } from "excalibur";
import { TickableController } from "./tickable-controller";
import { Ship } from "../actors/ship";
import { SpaceScene } from "../scenes/space";
import { linInt } from "../utils";
import { random } from "../main";
import { CosmicBody } from "../actors/cosmic-body";

export class HunterAI extends TickableController {
  #target?: Actor;

  #chase = false;
  #boost = false;

  #nearestObstacles = new Set<Actor>();

  #trigger: Actor;
  #triggerRadius = 40;

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
    const player = (_engine.currentScene as SpaceScene).player;
    if (!player) return;

    this.#target = player;

    const distance = _ship.pos.distance(this.#target.pos);

    this.#chase = distance > 200;
    this.#boost = distance > 300;

    _ship.speedMultiplier = linInt(distance, 400, 800, 1, 1.2);

    const dice = distance < 200 ? random.d20() : random.d10();
    if (distance < 300 && dice === 1) {
      _ship.fire();
    }

    if (distance > 100) {
      _ship.rotateTo(this.#target.pos.add(this.#target.vel.sub(_ship.vel)));
    } else {
      _ship.rotateTo(this.#target.pos);
    }
  }

  onUpdate(_engine: Engine, _delta: number, _ship: Ship): void {
    if (this.#chase) {
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
      _ship.addMotion(_ship.speed * multiplier, direction, _delta);
    });
  }

  onTakeDamage(_ship: Ship, _amount: number, _angle: number): void {
    const rotation = random.floating(0.5, 1.5);
    _ship.rotate(random.pickOne([-rotation, rotation]), true);
  }
}
