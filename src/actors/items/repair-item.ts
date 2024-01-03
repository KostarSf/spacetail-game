import { Vector } from "excalibur";
import { Item } from "./item";
import { Ship } from "../ship";

export class RepairItem extends Item {
  constructor(pos?: Vector) {
    super(pos);
  }

  onPickUp(_ship: Ship): void {
    _ship.controller.onRepair(_ship, 25);
  }
}
