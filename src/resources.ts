import {
  ImageSource,
  Loader,
  SpriteSheet,
  Animation,
  range,
  AnimationStrategy,
} from "excalibur";

const Resources = {
  Ship: {
    Player: {
      Default: new ImageSource("/assets/images/ship/player.png"),
      Damaged: new ImageSource("/assets/images/ship/player_damaged.png"),
    },
    Pirate: {
      Default: new ImageSource("/assets/images/ship/pirate.png"),
      Damaged: new ImageSource("/assets/images/ship/pirate_damaged.png"),
    },
  },
  Asteroid: {
    Small: [
      new ImageSource("/assets/images/asteroids/small-01.png"),
      new ImageSource("/assets/images/asteroids/small-02.png"),
    ],
    Medium: [
      new ImageSource("/assets/images/asteroids/medium-01.png"),
      new ImageSource("/assets/images/asteroids/medium-02.png"),
    ],
    Large: [
      new ImageSource("/assets/images/asteroids/large-01.png"),
      new ImageSource("/assets/images/asteroids/large-02.png"),
    ],
    Item: [
      new ImageSource("/assets/images/asteroids/item-01.png"),
      new ImageSource("/assets/images/asteroids/item-02.png"),
    ],
  },
  Particle: {
    Debree: new ImageSource("/assets/images/particles/debree.png"),
  },
  Dynamic: {
    Bullet: new ImageSource("/assets/images/dynamics/bullet.png"),
    Explosion: new ImageSource("/assets/images/dynamics/explosion.png"),
    JetStream: new ImageSource("/assets/images/ship/jet_stream.png"),
  },
  Items: {
    RepairItem: new ImageSource("/assets/images/items/repair-item.png"),
  },
};

function getAsteroidImage(
  type: keyof typeof Resources.Asteroid,
  index?: number
): ImageSource {
  const group = Resources.Asteroid[type];
  index ??= Math.floor(Math.random() * group.length);
  return group[index];
}

class Animations {
  static get Bullet() {
    const blinkSheet = SpriteSheet.fromImageSource({
      image: Resources.Dynamic.Bullet,
      grid: {
        rows: 1,
        columns: 2,
        spriteWidth: 8,
        spriteHeight: 6,
      },
    });

    const blinkAnimation = Animation.fromSpriteSheet(
      blinkSheet,
      range(0, 1),
      250
    );

    return blinkAnimation;
  }

  static get Explosion() {
    const explosionSheet = SpriteSheet.fromImageSource({
      image: Resources.Dynamic.Explosion,
      grid: {
        rows: 1,
        columns: 4,
        spriteWidth: 32,
        spriteHeight: 32,
      },
    });

    const explosionAnimation = Animation.fromSpriteSheet(
      explosionSheet,
      range(0, 3),
      100,
      AnimationStrategy.End
    );

    return explosionAnimation;
  }

  static get JetStream() {
    const jetSheet = SpriteSheet.fromImageSource({
      image: Resources.Dynamic.JetStream,
      grid: {
        rows: 1,
        columns: 2,
        spriteWidth: 32,
        spriteHeight: 32,
      },
    });

    const jetAnimation = Animation.fromSpriteSheet(jetSheet, range(0, 1), 150);

    return jetAnimation;
  }
}

class GameLoader extends Loader {
  constructor() {
    super([
      ...Object.values(Resources.Ship.Player),
      ...Object.values(Resources.Ship.Pirate),
      ...Object.values(Resources.Asteroid).flat(),
      ...Object.values(Resources.Particle),
      ...Object.values(Resources.Dynamic),
      ...Object.values(Resources.Items),
    ]);

    this.backgroundColor = "#000";
    this.playButtonText = "Play";
    this.logo = "/assets/images/logo.png";
    this.logoWidth = 256;
    this.logoHeight = 128;
  }
}

const loader = new GameLoader();

export { Resources, Animations, getAsteroidImage, loader };
