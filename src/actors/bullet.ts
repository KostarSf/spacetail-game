import { Actor, Engine, Vector, vec } from "excalibur";
import { Animations } from "../resources";
import { CosmicBody } from "./cosmic-body";

export class Bullet extends Actor {
  #parent: Actor;

  constructor(parent: Actor, offset = vec(0, 0)) {
    super({
      width: 8,
      height: 6,
      pos: parent.pos.add(offset),
      rotation: parent.rotation,
      scale: vec(1.5, 1.5),
      name: 'Bullet'
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
    this.vel = this.#parent.vel.add(
      Vector.fromAngle(this.#parent.rotation).scale(
        Math.max(300, 100 + this.#parent.vel.distance() * 0.9)
      )
    );
  }

  #setupCollisionEvents() {
    this.on("collisionstart", (event) => {
      if (event.other instanceof CosmicBody && event.other !== this.#parent) {
        const cosmicBody = event.other;
        cosmicBody.takeDamage(
          10,
          this.pos.sub(cosmicBody.pos).toAngle(),
          this.#parent
        );

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
  }
}
