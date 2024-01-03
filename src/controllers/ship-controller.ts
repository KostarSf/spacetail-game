import { Actor, Engine } from "excalibur";
import { Ship } from "../actors/ship";

export interface ShipController {
  get isPlayer(): boolean;
  get isPirate(): boolean;

  onInitialize(_engine: Engine, _ship: Ship): void;

  onPreUpdate(_engine: Engine, _delta: number, _ship: Ship): void;

  onPostUpdate(_engine: Engine, _delta: number, _ship: Ship): void;

  onTakeDamage(
    _ship: Ship,
    _amount: number,
    _angle: number,
    _source?: Actor
  ): void;

  onRepair(_ship: Ship, _amount: number): void;
}
