import { Color, Engine, Scene } from "excalibur";
import { Player } from "../actors/player";

class SpaceScene extends Scene {
  onInitialize(engine: Engine): void {
    // engine.backgroundColor = Color.Black

    const player = new Player();
    this.add(player)
  }

  static key = 'spacescene'
}

export default SpaceScene
