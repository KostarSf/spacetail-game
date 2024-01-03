import {
  Actor,
  ActorArgs,
  CollisionType,
  Color,
  Engine,
  ExcaliburGraphicsContext,
  Sprite,
  Vector,
  vec,
} from "excalibur";
import { Explosion } from "./explosion";
import { HitLabel } from "./hit-label";

export abstract class CosmicBody extends Actor {
  invincible = false;
  noClip = false;

  #mass: number;
  get mass() {
    return this.#mass;
  }

  #shadow?: Sprite;

  constructor(mass: number, actorConfig?: ActorArgs, shadow?: Sprite) {
    const initialActorConfig: ActorArgs = {
      radius: 10,
      color: Color.Chartreuse,
      collisionType: CollisionType.Passive,
      name: "CosmicBody",
    };

    super(Object.assign(initialActorConfig, actorConfig));
    this.#mass = mass;
    this.#shadow = shadow?.clone();
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

    this.graphics.onPreDraw = (ctx, delta) => this.onPreDraw(ctx, delta);
    this.graphics.onPostDraw = (ctx, delta) => this.onPostDraw(ctx, delta);
  }

  /** Destroy this cosmic body and emit explosion */
  destroy(): void {
    if (!this.isKilled()) this.onPreDestroy();

    this.scene.add(new Explosion(this.pos));
    this.kill();
  }

  protected onPreDestroy() {}

  takeDamage(_amount: number, _angle: number, _source?: Actor) {
    HitLabel.create(this, _amount);
  }

  addMotion(amount: number, direction = this.rotation, delta = 1) {
    this.vel = this.vel.add(Vector.fromAngle(direction).scale(amount * delta));
  }

  protected onPreDraw(ctx: ExcaliburGraphicsContext, _delta: number) {
    const shadow = this.#shadow;
    if (!shadow) return;

    const shadowOffset = 4;

    const origin = vec(-shadow.width / 2, -shadow.height / 2);
    const shadowOrigin = origin
      .add(vec(0, shadowOffset))
      .rotate(-this.rotation, origin);

    const transform = ctx.getTransform();
    const initialScale = transform.getScale();

    ctx.tint = Color.fromRGB(50, 50, 50);
    ctx.scale(0.94, 0.94);
    ctx.drawImage(shadow.image.image, shadowOrigin.x, shadowOrigin.y);

    transform.setScale(initialScale);
    ctx.tint = Color.White;
  }

  protected onPostDraw(_ctx: ExcaliburGraphicsContext, _delta: number) {}
}
