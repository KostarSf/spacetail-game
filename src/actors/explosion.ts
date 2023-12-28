import { Actor, Engine, Vector } from "excalibur";

export class Explosion extends Actor {
  constructor(pos: Vector) {
    super({ pos });
  }

  onInitialize(_engine: Engine): void {

  }
}
