import { Actor, CollisionType, Color, Engine, vec } from "excalibur";
import { getRandomAsteroidImage } from "../resources";

type AsteroidType = "Small" | "Medium" | "Large" | "Item";

const asteroidTypes: AsteroidType[] = ["Small", "Medium", "Large", "Item"];
const asteroidSizes = {
  Small: 8,
  Medium: 12,
  Item: 12,
  Large: 16
}
const asteroidMasses = {
  Small: 1,
  Medium: 5,
  Item: 5,
  Large: 20,
};

export class Asteroid extends Actor {
  #asteroidType: AsteroidType;
  #mass: number

  constructor() {
    // TODO - Сделать логику создания разных типов астероидов более красивой.
    // Через классы наследники, или как-то еще

    const asteroidType =
      asteroidTypes[Math.floor(Math.random() * asteroidTypes.length)];

    super({
      radius: asteroidSizes[asteroidType],
      color: Color.Chartreuse,
      collisionType: CollisionType.Passive,
    });

    this.#asteroidType = asteroidType;
    this.#mass = asteroidMasses[asteroidType]
  }

  onInitialize(engine: Engine): void {
    this.graphics.use(getRandomAsteroidImage(this.#asteroidType).toSprite());

    const spawnPoint = vec(
      Math.random() * engine.drawWidth,
      Math.random() * engine.drawHeight
    );

    this.pos = spawnPoint;

    this.on("precollision", (event) => {
      // TODO - сейчас сила отбрасывания вычисляется только из текущей скорости
      // объекта. Соответственно, если он стоит, его ничего не может сдвинуть.
      // Нужно складывать (или вычитать) скорости обоих тел, с учетом массы,
      // и уже этот результат применять на объект
      // TODO - Дублирование кода коллизии.
      if (event.other instanceof Asteroid) {
        const asteroid = event.other;

        const direction = this.pos.sub(asteroid.pos);
        const speed = this.vel.distance();
        const force = direction.scale(speed * 0.008);

        this.vel = this.vel.add(force.scale(1 / this.#mass));

        asteroid.vel = asteroid.vel.add(force.scale(-1 / asteroid.getMass()));
      }
    });
  }

  onPostUpdate(engine: Engine, _delta: number): void {
    const offset = 32

    const screenWidthOffset = engine.drawWidth + offset
    const screenHeightOffset = engine.drawHeight + offset
    const {x, y} = engine.worldToScreenCoordinates(this.pos)

    if (x < -offset) {
      this.pos.x += screenWidthOffset
    }

    if (x > screenWidthOffset) {
      this.pos.x -= screenWidthOffset
    }

    if (y < -offset) {
      this.pos.y += screenHeightOffset
    }

    if (y > screenHeightOffset) {
      this.pos.y -= screenHeightOffset
    }
  }

  getMass() {
    return this.#mass
  }

  static randomSpawn(count: number) {
    const asteroids: Asteroid[] = [];
    for (let i = 0; i < count; i++) {
      asteroids.push(new Asteroid());
    }
    return asteroids;
  }
}
