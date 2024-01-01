import { Engine, Sprite, vec } from "excalibur";
import { getAsteroidImage } from "../resources";
import { CosmicBody } from "./cosmic-body";
import { random } from "../main";

const ASTEROIDS_PRESETS = {
  Small: { size: 8, mass: 1, health: 5, hasItem: false },
  Medium: { size: 12, mass: 5, health: 15, hasItem: false },
  Large: { size: 16, mass: 20, health: 40, hasItem: false },
  Item: { size: 12, mass: 5, health: 15, hasItem: true },
} satisfies Record<string, AsteroidParameters>;

type AsteroidType = keyof typeof ASTEROIDS_PRESETS;
type AsteroidParameters = {
  size: number;
  mass: number;
  health: number;
  hasItem: boolean;
};

export class Asteroid extends CosmicBody {
  #sprite: Sprite;
  #health: number;

  constructor(parameters: AsteroidParameters, sprite: Sprite) {
    super(parameters.mass, {
      radius: parameters.size,
      vel: vec(random.floating(-10, 10), random.floating(-10, 10)),
      angularVelocity: random.floating(-Math.PI / 4, Math.PI / 4),
      rotation: random.floating(0, 2 * Math.PI),
    });

    this.#sprite = sprite;
    this.#health = parameters.health;
  }

  onInitialize(_engine: Engine): void {
    super.onInitialize(_engine);

    this.graphics.use(this.#sprite);

    const spawnPoint = vec(
      Math.random() * _engine.drawWidth,
      Math.random() * _engine.drawHeight
    );

    this.pos = spawnPoint;
  }

  onPostUpdate(engine: Engine, _delta: number): void {
    const offset = 32;

    const screenWidthOffset = engine.drawWidth + offset;
    const screenHeightOffset = engine.drawHeight + offset;
    const { x, y } = engine.worldToScreenCoordinates(this.pos);

    if (x < -offset) {
      this.pos.x += screenWidthOffset;
    } else if (x > screenWidthOffset) {
      this.pos.x -= screenWidthOffset;
    }

    if (y < -offset) {
      this.pos.y += screenHeightOffset;
    } else if (y > screenHeightOffset) {
      this.pos.y -= screenHeightOffset;
    }
  }

  takeDamage(amount: number, angle: number): void {
    this.addMotion((amount * 10) / this.mass, angle - Math.PI);

    if (this.invincible) return;

    this.#health -= amount;

    if (this.#health <= 0) {
      this.destroy();
    }
  }

  static randomSpawn(count: number) {
    const asteroids: Asteroid[] = [];
    const types = Object.keys(ASTEROIDS_PRESETS) as AsteroidType[];

    for (let i = 0; i < count; i++) {
      const type = random.pickOne(types);
      asteroids.push(Asteroid.create(type));
    }
    return asteroids;
  }

  static create(type: AsteroidType) {
    const preset = ASTEROIDS_PRESETS[type];
    const sprite = getAsteroidImage(type).toSprite();

    return new Asteroid(preset, sprite);
  }
}
