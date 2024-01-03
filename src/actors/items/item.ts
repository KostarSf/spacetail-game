import { Actor, CollisionType, Color, Engine, Vector } from "excalibur";
import { Ship } from "../ship";
import { random } from "../../main";

export abstract class Item extends Actor {
  constructor(pos?: Vector) {
    super({
      pos,
      vel: Vector.fromAngle(random.floating(0, Math.PI * 2)).scale(3),
      radius: 16,
      color: Color.Green,
      collisionType: CollisionType.Passive,
    });
  }

  onInitialize(_engine: Engine): void {
    this.on("collisionstart", (e) => {
      if (e.other instanceof Ship) {
        this.onPickUp(e.other);
        this.kill();
      }
    });
  }

  onPickUp(_ship: Ship) {}
}
