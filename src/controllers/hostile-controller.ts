import { Actor, Engine, Timer } from "excalibur";
import { Ship } from "../actors/ship";
import { ShipController } from "./ship-controller";
import { SpaceScene } from "../scenes/space";
import { random } from "../main";
import { linInt } from "../utils";

export class HostileController implements ShipController {
  #target?: Actor;

  #chase = false;
  #boost = false;

  get isPlayer(): boolean {
    return false;
  }

  onInitialize(engine: Engine, ship: Ship): void {
    const logicTimer = new Timer({
      fcn: () => this.#logicUpdate(engine, ship),
      repeats: true,
      interval: 200,
    });

    engine.currentScene.add(logicTimer);
    logicTimer.start();

    ship.on("kill", () => {
      engine.currentScene.cancelTimer(logicTimer);
    });
  }

  #logicUpdate(engine: Engine, ship: Ship) {
    const player = (engine.currentScene as SpaceScene).player;
    if (!player) return;

    this.#target = player;

    const distance = ship.pos.distance(this.#target.pos);

    this.#chase = distance > 200;
    this.#boost = distance > 300;

    ship.speedMultiplier = linInt(distance, 400, 800, 1, 1.2);

    const dice = distance < 200 ? random.d20() : random.d10();
    if (distance < 300 && dice === 1) {
      ship.fire();
    }

    if (distance > 100) {
      ship.rotateTo(this.#target.pos.add(this.#target.vel.sub(ship.vel)));
    } else {
      ship.rotateTo(this.#target.pos);
    }
  }

  onUpdate(engine: Engine, delta: number, ship: Ship): void {
    if (this.#chase) {
      ship.accelerate();
      ship.boost(this.#boost);
    }
  }

  onTakeDamage(ship: Ship, amount: number, angle: number): void {
    const rotation = random.floating(0.5, 1.5);
    ship.rotate(random.pickOne([-rotation, rotation]), true);
  }
}
