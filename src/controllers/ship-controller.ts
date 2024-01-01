import { Engine } from "excalibur";
import { Ship } from "../actors/ship";

export interface ShipController {
  get isPlayer(): boolean;

  onInitialize(_engine: Engine, _ship: Ship): void;

  onUpdate(_engine: Engine, _delta: number, _ship: Ship): void;

  onTakeDamage(_ship: Ship, _amount: number, _angle: number): void;
}
