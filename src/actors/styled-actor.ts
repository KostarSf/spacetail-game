import {
  Actor,
  ActorArgs,
  Color,
  ExcaliburGraphicsContext,
  Sprite,
  vec,
} from "excalibur";

export type StyledActorArgs = ActorArgs & {
  shadowSprite?: Sprite;
};

export class StyledActor extends Actor {
  #shadowSprite?: Sprite;

  constructor(config?: StyledActorArgs | undefined) {
    super(config);

    this.#shadowSprite = config?.shadowSprite;

    this.graphics.onPreDraw = (ctx, delta) => this.onPreDraw(ctx, delta);
    this.graphics.onPostDraw = (ctx, delta) => this.onPostDraw(ctx, delta);
  }

  protected onPreDraw(ctx: ExcaliburGraphicsContext, _delta: number) {
    if (!this.#shadowSprite) return;
    const shadow = this.#shadowSprite;

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
