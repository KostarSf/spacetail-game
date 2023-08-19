import { Color, Engine, Scene } from "excalibur";
import { Asteroid } from "../actors/asteroid";
import { Player } from "../actors/player";

class SpaceScene extends Scene {
  onInitialize(engine: Engine): void {
    engine.backgroundColor = Color.Black;

    const player = new Player();
    const asteroids = Asteroid.randomSpawn(20);

    this.add(player);
    asteroids.forEach((asteroid) => {
      this.add(asteroid);
    });

    this.camera.strategy.elasticToActor(player, 0.5, 0.1);
    this.camera.pos = player.pos;
  }

  static key = "spacescene";
}

export default SpaceScene;
