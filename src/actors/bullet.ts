import {
  Actor,
  Animation,
  Engine,
  SpriteSheet,
  Vector,
  range,
  vec,
} from "excalibur";
import { Resources } from "../resources";
import { Asteroid } from "./asteroid";

export class Bullet extends Actor {
  #parent: Actor;

  constructor(parent: Actor, offset = vec(0, 0)) {
    super({
      width: 8,
      height: 6,
      pos: parent.pos.add(offset),
      rotation: parent.rotation,
      scale: vec(1.5, 1.5),
    });

    this.#parent = parent;
  }

  onInitialize(_engine: Engine): void {
    this.#setupBulletMotion();
    this.#setupSpriteAnimation();
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

  #setupCollisionEvents() {
    this.on("collisionstart", (event) => {
      if (event.other instanceof Asteroid) {
        const asteroid = event.other;
        asteroid.takeDamage();

        this.actions.clearActions();
        this.kill();
      }
    });
  }

  onPostUpdate(_engine: Engine, _delta: number): void {
    // TODO - рейт замедления нужно будет потом динамически доставать из родителя
    // чтобы пули всегда летели параллельно кораблю
    this.vel = this.vel.scale(0.995);

    const newScale = this.scale.x - 0.3 * (_delta / 1000);
    this.scale = vec(newScale, newScale);
  }
}
