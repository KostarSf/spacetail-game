import { Engine } from "excalibur";
import { Ship } from "../actors/ship";
import { ShipController } from "./ship-controller";

export class DummyController implements ShipController {
  get isPlayer(): boolean {
    return false;
  }

  get isPirate(): boolean {
    return false;
  }

  onInitialize(_engine: Engine, _ship: Ship): void {}

  onUpdate(_engine: Engine, _delta: number, _ship: Ship): void {}

  onTakeDamage(_ship: Ship, _amount: number, _angle: number): void {}
}
