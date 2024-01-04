import { Vector } from "excalibur";
import { Item } from "./item";
import { Ship } from "../ship";
import { Resources } from "../../resources";
import { ShadowedSprite } from "../../graphics/shadowed-sprite";

export class RepairItem extends Item {
    constructor(pos?: Vector) {
        super({ pos, sprite: ShadowedSprite.from(Resources.Items.RepairItem) });
    }

    onPickUp(_ship: Ship): void {
        _ship.controller.onRepair(_ship, 25);
    }
}
