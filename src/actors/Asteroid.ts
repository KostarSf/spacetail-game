import { CollisionGroupManager, Engine, Random, vec } from "excalibur";
import { getRandomAsteroidImage } from "../resources";
import CosmicBody from "./CosmicBody";

type AsteroidType = "Small" | "Medium" | "Large" | "Item";

const asteroidTypes: AsteroidType[] = ["Small", "Medium", "Large", "Item"];
const asteroidSizes = {
  Small: 8,
  Medium: 12,
  Item: 12,
  Large: 16,
};
const asteroidMasses = {
  Small: 1,
  Medium: 5,
  Item: 5,
  Large: 20,
};

// TODO - Сделать фабрику, которая будет сама делать нужные астероиды.
// либо определенные, либо случайные
// астероид с предметом получается с некоторым шансом из среднего астероида

export const asteroidGroup = CollisionGroupManager.create("asteroid");

export default class Asteroid extends CosmicBody {
  #asteroidType: AsteroidType;

  constructor() {
    // TODO - Сделать логику создания разных типов астероидов более красивой.
    // Через классы наследники, или как-то еще

    const asteroidType =
      asteroidTypes[Math.floor(Math.random() * asteroidTypes.length)];

    const random = new Random();

    super(asteroidMasses[asteroidType], {
      radius: asteroidSizes[asteroidType],
      vel: vec(random.floating(-10, 10), random.floating(-10, 10)),
      // collisionGroup: asteroidGroup,
    });

    this.#asteroidType = asteroidType;
  }

  onInitialize(_engine: Engine): void {
    super.onInitialize(_engine);

    this.graphics.use(getRandomAsteroidImage(this.#asteroidType).toSprite());

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
    }

    if (x > screenWidthOffset) {
      this.pos.x -= screenWidthOffset;
    }

    if (y < -offset) {
      this.pos.y += screenHeightOffset;
    }

    if (y > screenHeightOffset) {
      this.pos.y -= screenHeightOffset;
    }
  }

  takeDamage() {
    this.kill();
  }

  static randomSpawn(count: number) {
    const asteroids: Asteroid[] = [];
    for (let i = 0; i < count; i++) {
      asteroids.push(new Asteroid());
    }
    return asteroids;
  }
}
