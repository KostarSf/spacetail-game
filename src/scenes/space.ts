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
import { Ship } from "../actors/ship";
import { PlayerController } from "../controllers/player-controller";
import { DummyController } from "../controllers/dummy-controller";

export class SpaceScene extends Scene {
  static key = "spacescene";

  #starsParticles: ParticleEmitter;
  #player!: Actor;

  constructor() {
    super();

    this.#starsParticles = new ParticleEmitter({});
  }

  onInitialize(engine: Engine): void {
    engine.backgroundColor = Color.Black;

    const player = new Ship({
      pos: vec(150, 150),
      controller: new PlayerController(),
    });

    this.add(player);
    this.#player = player;

    this.add(
      new Ship({
        pos: vec(150, 50),
        controller: new DummyController(),
        colliderScale: 1.5,
      })
    );

    Asteroid.randomSpawn(10).forEach((asteroid) => this.add(asteroid));

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
