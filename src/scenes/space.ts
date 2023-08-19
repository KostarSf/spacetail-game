import { Color, Engine, Scene } from "excalibur";
import { Player } from "../actors/player";
import { Asteroid } from "../actors/asteroid";

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
  }

  static key = "spacescene";
}

export default SpaceScene;
