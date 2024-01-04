import { Actor, Color, Engine, Scene, Sprite, Timer, vec } from "excalibur";
import { game, random } from "../main";
import { getAsteroidImage } from "../resources";
import { CosmicBody } from "./cosmic-body";
import { RepairItem } from "./items/repair-item";

const ASTEROIDS_PRESETS = {
  Small: { size: 8, mass: 1, health: 5, hasItem: false, type: "Small" },
  Medium: { size: 12, mass: 5, health: 15, hasItem: false, type: "Medium" },
  Large: { size: 16, mass: 20, health: 40, hasItem: false, type: "Large" },
  Item: { size: 12, mass: 5, health: 15, hasItem: true, type: "Item" },
} satisfies Record<AsteroidType, AsteroidParameters>;

type AsteroidType = "Small" | "Medium" | "Large" | "Item";
type AsteroidParameters = {
  size: number;
  mass: number;
  health: number;
  hasItem: boolean;
  type: AsteroidType;
};

export class Asteroid extends CosmicBody {
  static SPAWN_OFFSET = 2000;

  #type: AsteroidType;
  get type() {
    return this.#type;
  }

  #sprite: Sprite;
  #health: number;
  #size: number;

  constructor(parameters: AsteroidParameters, sprite: Sprite) {
    super(
      parameters.mass,
      {
        radius: parameters.size,
        vel: vec(random.floating(-30, 30), random.floating(-30, 30)),
        angularVelocity: random.floating(-Math.PI / 3, Math.PI / 3),
        rotation: random.floating(0, 2 * Math.PI),
        name: `Asteroid (${parameters.type})`,
      },
      sprite
    );

    this.#sprite = sprite;
    this.#health = parameters.health;
    this.#size = parameters.size;
    this.#type = parameters.type;
  }

  onInitialize(_engine: Engine): void {
    super.onInitialize(_engine);

    this.#sprite.tint = Color.LightGray;
    this.graphics.use(this.#sprite);

    if (this.noClip) {
      const timer = new Timer({
        fcn: () => {
          console.log("fired");
          this.noClip = false;
        },
        interval: 400,
        repeats: false,
      });

      _engine.currentScene.addTimer(timer);
      timer.start();
    }
  }

  onPostUpdate(_engine: Engine, _delta: number): void {
    super.onPostUpdate(_engine, _delta);

    const offset = Asteroid.SPAWN_OFFSET;

    const screenWidthOffset = _engine.drawWidth + offset;
    const screenHeightOffset = _engine.drawHeight + offset;
    const { x, y } = _engine.worldToScreenCoordinates(this.pos);

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

  takeDamage(_amount: number, _angle: number, _source?: Actor): void {
    super.takeDamage(_amount, _angle, _source);

    this.addMotion((_amount * 10) / this.mass, _angle - Math.PI);

    if (this.invincible) return;

    this.#health -= _amount;

    if (this.#health <= 0) {
      this.destroy();
    }
  }

  protected onPreDestroy(): void {
    if (this.#type === "Large" || this.#type === "Medium") {
      const piecesCount = random.integer(0, 2);
      const piecesType: AsteroidType =
        this.#type === "Large" ? "Medium" : "Small";

      for (let i = 0; i < piecesCount; i++) {
        const asteroid = Asteroid.create(piecesType);
        const angle = Math.PI * 0.4;

        asteroid.pos = this.pos
          .clone()
          .add(
            vec(
              random.integer(-this.#size / 2, this.#size / 2),
              random.integer(-this.#size / 2, this.#size / 2)
            )
          );
        asteroid.vel = asteroid.vel.add(
          this.vel.clone().rotate(random.floating(-angle, angle))
        );
        asteroid.noClip = true;

        this.scene.add(asteroid);
      }
    }

    if (this.#type === "Item") {
      this.scene.add(new RepairItem(this.pos));
    }
  }

  static randomSpawn(count: number, scene?: Scene) {
    const newAsteroids: Asteroid[] = [];
    const types = Object.keys(ASTEROIDS_PRESETS) as AsteroidType[];

    const offset = Asteroid.SPAWN_OFFSET;

    for (let i = 0; i < count; i++) {
      const type = random.pickOne(types);
      const asteroid = Asteroid.create(type);

      asteroid.pos = vec(
        random.integer(-offset, game.drawWidth + offset),
        random.integer(-offset, game.drawHeight + offset)
      );

      newAsteroids.push(asteroid);
      scene?.add(asteroid);
    }

    return newAsteroids;
  }

  static create(type: AsteroidType) {
    const preset = ASTEROIDS_PRESETS[type];
    const sprite = getAsteroidImage(type).toSprite();

    return new Asteroid(preset, sprite);
  }
}
