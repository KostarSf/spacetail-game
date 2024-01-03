import { Vector } from "excalibur";
import { Item } from "./item";
import { Ship } from "../ship";
import { Resources } from "../../resources";

export class RepairItem extends Item {
  constructor(pos?: Vector) {
    super({ pos, sprite: Resources.Items.RepairItem.toSprite() });
  }

  onPickUp(_ship: Ship): void {
    _ship.controller.onRepair(_ship, 25);
  }
}
