import { Actor, Engine, Vector, vec } from "excalibur";
import { Animations } from "../resources";
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
    this.#setupCollisionEvents();

    this.graphics.use(Animations.Bullet);
    this.actions.delay(5000).die();
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
    // this.vel = this.vel.scale(0.995);

    const newScale = this.scale.x - 0.3 * (_delta / 1000);
    this.scale = vec(newScale, newScale);

    if (this.isOffScreen && !this.isKilled()) {
      this.kill();
    }
  }
}