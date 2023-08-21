import {
  Actor,
  Animation,
  EmitterType,
  Engine,
  ParticleEmitter,
  Random,
  SpriteSheet,
  Vector,
  range,
  vec,
} from "excalibur";
import { Resources } from "../resources";
import { Asteroid } from "./asteroid";

export class Bullet extends Actor {
  #parent: Actor;
  #particles: ParticleEmitter;

  static #random = new Random();

  constructor(parent: Actor, offset = vec(0, 0)) {
    super({
      width: 8,
      height: 6,
      pos: parent.pos.add(offset),
      rotation: parent.rotation,
      scale: vec(1.5, 1.5),
    });

    this.#parent = parent;
    this.#particles = new ParticleEmitter({
      emitterType: EmitterType.Circle,
      radius: 5,
      minVel: 5,
      maxVel: 50,
      minAngle: 0,
      maxAngle: Math.PI * 2,
      emitRate: 20,
      fadeFlag: true,
      particleLife: Bullet.#random.integer(600, 800),
      minSize: 0.5,
      maxSize: 1,
      isEmitting: true,
    });
  }

  onInitialize(engine: Engine): void {
    this.#setupBulletMotion();
    this.#setupSpriteAnimation();
    this.#setupBulletParticles();
    this.#setupCollisionEvents();
    this.actions.delay(5000).die();
  }

  #setupSpriteAnimation() {
    const blinkSheet = SpriteSheet.fromImageSource({
      image: Resources.Dynamic.Bullet,
      grid: {
        rows: 1,
        columns: 2,
        spriteWidth: 8,
        spriteHeight: 6,
      },
    });

    const blinkAnimation = Animation.fromSpriteSheet(
      blinkSheet,
      range(0, 1),
      250
    );

    this.graphics.use(blinkAnimation);
  }

  #setupBulletMotion() {
    this.vel = this.#parent.vel
      .scale(1)
      .add(
        Vector.fromAngle(this.#parent.rotation).scale(
          Math.max(300, 100 + this.#parent.vel.distance() * 0.8)
        )
      );
  }

  #setupBulletParticles() {
    const particlesSheet = SpriteSheet.fromImageSource({
      image: Resources.Particle.Debree,
      grid: {
        rows: 1,
        columns: 2,
        spriteWidth: 6,
        spriteHeight: 3,
      },
    });
    const particlesAnimation = Animation.fromSpriteSheet(
      particlesSheet,
      range(0, 1),
      250
    );

    this.#particles.graphics.use(particlesAnimation);
    this.addChild(this.#particles);
  }

  #setupCollisionEvents() {
    this.on("collisionstart", (event) => {
      if (event.other instanceof Asteroid) {
        const asteroid = event.other;
        asteroid.takeDamage();

        this.actions.clearActions();
        this.actions
          .callMethod(() => {
            this.#particles.acc = this.vel;
            this.#particles.maxVel = 100;
            this.#particles.minVel = 60;
            this.#particles.emitRate = 200;
            this.#particles.particleLife = 1500;
          })
          .delay(20)
          .die();
      }
    });
  }

  onPostUpdate(_engine: Engine, _delta: number): void {
    // TODO - рейт замедления нужно будет потом динамически доставать из родителя
    // чтобы пули всегда летели параллельно кораблю
    this.vel = this.vel.scale(0.995);

    const newScale = this.scale.x - 0.3 * (_delta / 1000);
    this.scale = vec(newScale, newScale);

    if (newScale < 0.3) {
      this.#particles.particleLife = 2000;
      this.#particles.maxVel = 100;
    }
  }
}
