import { Actor, Engine, Vector } from "excalibur";
import { Animations } from "../resources";

export class Explosion extends Actor {
  constructor(pos?: Vector) {
    super({ pos, name: 'Explosion' });
  }

  onInitialize(_engine: Engine): void {
    const animation = Animations.Explosion;
    animation.events.on("end", () => {
      this.actions.clearActions();
      this.kill();
    });

    this.graphics.use(animation);
    this.actions.delay(1500).die();
  }
}
