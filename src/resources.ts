import { ImageSource, Loader } from "excalibur";
import ship from "./assets/images/ship/default.png";
import logo from "./assets/images/logo.png";

const Resources = {
  Ship: new ImageSource(ship),
};

class GameLoader extends Loader {
  constructor () {
    super([Resources.Ship]);
    this.backgroundColor = '#000'
    this.playButtonText = "Play";
    this.logo = logo;
    this.logoWidth = 256;
    this.logoHeight = 128;
  }
}

const loader = new GameLoader()

export { Resources, loader };
