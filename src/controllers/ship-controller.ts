import { Engine } from "excalibur";
import { Ship } from "../actors/ship";

export interface ShipController {
  get isPlayer(): boolean;

  onInitialize(engine: Engine, ship: Ship): void;

  onUpdate(engine: Engine, delta: number, ship: Ship): void;
}
