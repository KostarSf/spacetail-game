import {
  Actor,
  Color,
  EmitterType,
  Engine,
  ParticleEmitter,
  Scene,
  vec,
} from "excalibur";
import { Asteroid } from "../actors/asteroid";
import { Player } from "../actors/player";

class SpaceScene extends Scene {
  static key = "spacescene";

  #starsParticles: ParticleEmitter;
  #player!: Actor;

  constructor() {
    super();

    this.#starsParticles = new ParticleEmitter({});
  }

  onInitialize(engine: Engine): void {
    engine.backgroundColor = Color.Black;

    const player = new Player();
    this.add(player);
    this.#player = player;

    const asteroids = Asteroid.randomSpawn(20);
    asteroids.forEach((asteroid) => {
      this.add(asteroid);
    });

    this.camera.strategy.elasticToActor(player, 0.5, 0.1);
    this.camera.pos = player.pos;

    this.#starsParticles = new ParticleEmitter({
      emitterType: EmitterType.Rectangle,
      width: engine.drawWidth,
      height: engine.drawHeight,
      x: -engine.halfDrawWidth,
      y: -engine.halfDrawHeight,
      minAngle: 0,
      maxAngle: Math.PI * 2,
      emitRate: 50,
      fadeFlag: true,
      minSize: 0.8,
      maxSize: 1,
      particleLife: 5000,
      isEmitting: true,
      opacity: 0.8,
    });

    engine.currentScene.add(this.#starsParticles);
  }

  onPostUpdate(engine: Engine, _delta: number): void {
    this.#starsParticles.transform.pos = this.#player.pos.sub(
      vec(engine.halfDrawWidth, engine.halfDrawHeight)
    );
  }
}

export default SpaceScene;
