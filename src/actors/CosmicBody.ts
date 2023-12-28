import {
  Actor,
  ActorArgs,
  // CollisionGroup,
  // CollisionGroupManager,
  CollisionType,
  Color,
  Engine,
} from "excalibur";

// const cosmicBodyGroup = CollisionGroupManager.create("cosmicBody");
// const cosmicBodyCanCollideWith = CollisionGroup.collidesWith([cosmicBodyGroup])

export default class CosmicBody extends Actor {
  #mass: number;
  get mass() {
    return this.#mass;
  }

  constructor(mass: number, actorConfig?: ActorArgs) {
    const initialActorConfig: ActorArgs = {
      radius: 10,
      color: Color.Chartreuse,
      collisionType: CollisionType.Passive,
      // collisionGroup: cosmicBodyGroup,
    };

    super(Object.assign(initialActorConfig, actorConfig));
    this.#mass = mass;
  }

  onInitialize(_engine: Engine): void {
    this.on("precollision", (event) => {
      if (!(event.other instanceof CosmicBody)) return;
      const other = event.other;

      const direction = this.pos.sub(other.pos);
      const speed = this.vel.distance();
      const force = direction.scale(speed * 0.008);

      this.vel = this.vel
        .add(force.add(other.vel.scale(0.2 / this.mass)))
        .scale(0.9);

      other.vel = other.vel.add(force.scale(-1 / other.mass));
    });
  }
}
