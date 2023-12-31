import { Engine } from "excalibur";
import { Ship } from "../actors/ship";
import { ShipController } from "./ship-controller";

export class DummyController implements ShipController {
  get isPlayer(): boolean {
    return false;
  }

  onInitialize(engine: Engine, ship: Ship): void {}

  onUpdate(engine: Engine, delta: number, ship: Ship): void {
    ship.rotate(Math.PI * 0.8 * delta * 0.001);
    ship.accelerate();
  }
}
