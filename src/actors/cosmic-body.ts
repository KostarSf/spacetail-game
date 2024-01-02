import {
  Actor,
  ActorArgs,
  CollisionType,
  Color,
  Engine,
  Vector,
} from "excalibur";
import { Explosion } from "./explosion";

export class CosmicBody extends Actor {
  invincible = false;
  noClip = false;

  #mass: number;
  get mass() {
    return this.#mass;
  }

  constructor(mass: number, actorConfig?: ActorArgs) {
    const initialActorConfig: ActorArgs = {
      radius: 10,
      color: Color.Chartreuse,
      collisionType: CollisionType.Passive,
      name: 'CosmicBody',
    } ;

    super(Object.assign(initialActorConfig, actorConfig));
    this.#mass = mass;
  }

  onInitialize(_engine: Engine): void {
    this.on("precollision", (event) => {
      if (!(event.other instanceof CosmicBody)) return;
      const other = event.other;

      if (this.noClip || other.noClip) return;

      const direction = this.pos.sub(other.pos);
      const speed = this.vel.distance();
      const force = direction.scale(speed * 0.008);

      this.vel = this.vel
        .add(force.add(other.vel.scale(0.2 / this.mass)))
        .scale(0.9);

      other.vel = other.vel.add(force.scale(-1 / other.mass));
    });
  }

  /** Destroy this cosmic body and emit explosion */
  destroy(): void {
    if (!this.isKilled()) this.onPreDestroy();

    this.scene.add(new Explosion(this.pos));
    this.kill();
  }

  protected onPreDestroy() {}

  takeDamage(_amount: number, _angle: number, _source?: Actor) {}

  addMotion(amount: number, direction = this.rotation, delta = 1) {
    this.vel = this.vel.add(Vector.fromAngle(direction).scale(amount * delta));
  }
}
