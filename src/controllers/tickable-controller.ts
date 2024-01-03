import { Engine, Timer } from "excalibur";
import { Ship } from "../actors/ship";
import { ShipController } from "./ship-controller";

export abstract class TickableController implements ShipController {
  #ticksInterval: number;

  get isPlayer(): boolean {
    return false;
  }

  get isPirate(): boolean {
    return false;
  }

  constructor(parameters?: { ticksInterval?: number }) {
    this.#ticksInterval = parameters?.ticksInterval ?? 250;
  }

  onInitialize(_engine: Engine, _ship: Ship): void {
    const logicTimer = new Timer({
      fcn: () => this.onTick(_engine, _ship),
      repeats: true,
      interval: this.#ticksInterval,
    });

    _engine.currentScene.add(logicTimer);
    logicTimer.start();

    _ship.on("kill", () => {
      _engine.currentScene.cancelTimer(logicTimer);
    });
  }

  onTick(_engine: Engine, _ship: Ship) {}

  onPreUpdate(_engine: Engine, _delta: number, _ship: Ship): void {}

  onPostUpdate(_engine: Engine, _delta: number, _ship: Ship): void {}

  onTakeDamage(_ship: Ship, _amount: number, _angle: number): void {}
}
