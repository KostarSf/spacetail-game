import { ImageSource, Loader } from "excalibur";

const Resources = {
  Ship: new ImageSource("/assets/images/ship/default.png"),
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
  },
};

function getRandomAsteroidImage(
  type: keyof typeof Resources.Asteroid
): ImageSource {
  const group = Resources.Asteroid[type];
  const index = Math.floor(Math.random() * group.length);
  return group[index];
}

class GameLoader extends Loader {
  constructor() {
    super([
      Resources.Ship,
      ...Resources.Asteroid.Small,
      ...Resources.Asteroid.Medium,
      ...Resources.Asteroid.Large,
      ...Resources.Asteroid.Item,
      Resources.Particle.Debree,
      Resources.Dynamic.Bullet,
    ]);

    this.backgroundColor = "#000";
    this.playButtonText = "Play";
    this.logo = "/assets/images/logo.png";
    this.logoWidth = 256;
    this.logoHeight = 128;
  }
}

const loader = new GameLoader();

export { Resources, getRandomAsteroidImage, loader };
