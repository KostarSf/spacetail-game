import { DisplayMode, Engine } from "excalibur";
import { loader } from "./resources";
import SpaceScene from "./scenes/space";

class Game extends Engine {
  constructor() {
    super({
      width: 800,
      height: 600,
      displayMode: DisplayMode.FitScreen,
      antialiasing: false,
    });
  }

  initialize() {
    this.add(SpaceScene.key, new SpaceScene());
    this.goToScene(SpaceScene.key);
    this.start(loader);

    return this;
  }
}

export const game = new Game().initialize();
