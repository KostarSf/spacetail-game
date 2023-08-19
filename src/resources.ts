import { ImageSource, Loader } from "excalibur";
import ship from "./assets/images/ship/default.png";
import logo from "./assets/images/logo.png";
import asteroidSmall1 from './assets/images/asteroids/small-01.png'
import asteroidSmall2 from './assets/images/asteroids/small-02.png'
import asteroidMedium1 from './assets/images/asteroids/medium-01.png'
import asteroidMedium2 from './assets/images/asteroids/medium-02.png'
import asteroidLarge1 from './assets/images/asteroids/large-01.png'
import asteroidLarge2 from './assets/images/asteroids/large-02.png'
import asteroidItem1 from "./assets/images/asteroids/item-01.png";
import asteroidItem2 from "./assets/images/asteroids/item-02.png";

const Resources = {
  Ship: new ImageSource(ship),
  Asteroid: {
    Small: {
      1: new ImageSource(asteroidSmall1),
      2: new ImageSource(asteroidSmall2),
    },
    Medium: {
      1: new ImageSource(asteroidMedium1),
      2: new ImageSource(asteroidMedium2),
    },
    Large: {
      1: new ImageSource(asteroidLarge1),
      2: new ImageSource(asteroidLarge2),
    },
    Item: {
      1: new ImageSource(asteroidItem1),
      2: new ImageSource(asteroidItem2),
    },
  },
};

function getRandomAsteroidImage(
  type: "Small" | "Medium" | "Large" | "Item"
): ImageSource {
  const asteroidGroup = Resources.Asteroid[type];
  const keys = Object.keys(asteroidGroup);
  const index = Math.floor(Math.random() * keys.length);
  return asteroidGroup[keys[index]];
}

class GameLoader extends Loader {
  constructor () {
    super([
      Resources.Ship,
      Resources.Asteroid.Small[1],
      Resources.Asteroid.Small[2],
      Resources.Asteroid.Medium[1],
      Resources.Asteroid.Medium[2],
      Resources.Asteroid.Large[1],
      Resources.Asteroid.Large[2],
      Resources.Asteroid.Item[1],
      Resources.Asteroid.Item[2],
    ]);
    this.backgroundColor = '#000'
    this.playButtonText = "Play";
    this.logo = logo;
    this.logoWidth = 256;
    this.logoHeight = 128;
  }
}

const loader = new GameLoader()

export { Resources, loader, getRandomAsteroidImage };
