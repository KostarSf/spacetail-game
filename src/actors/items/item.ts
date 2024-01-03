import { CollisionType, Color, Engine, Sprite, Vector } from "excalibur";
import { Ship } from "../ship";
import { random } from "../../main";
import { StyledActor } from "../styled-actor";

export abstract class Item extends StyledActor {
  #sprite?: Sprite;

  constructor(parameters: { sprite?: Sprite; pos?: Vector }) {
    super({
      pos: parameters.pos,
      vel: Vector.fromAngle(random.floating(0, Math.PI * 2)).scale(100),
      radius: 16,
      color: Color.Green,
      collisionType: CollisionType.Passive,
      shadowSprite: parameters.sprite,
    });

    this.#sprite = parameters.sprite;
  }

  onInitialize(_engine: Engine): void {
    if (this.#sprite) {
      this.graphics.use(this.#sprite);
    }

    this.on("collisionstart", (e) => {
      if (e.other instanceof Ship) {
        this.onPickUp(e.other);
        this.kill();
      }
    });
  }

  onPickUp(_ship: Ship) {}

  onPostUpdate(_engine: Engine, _delta: number): void {
    if (this.vel.size > 3) {
      this.vel.scaleEqual(0.97);
    }
  }
}
