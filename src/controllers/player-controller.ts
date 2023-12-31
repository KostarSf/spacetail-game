import { Engine, Keys } from "excalibur";
import { ShipController } from "./ship-controller";
import { Ship } from "../actors/ship";
import { CosmicBody } from "../actors/cosmic-body";

export class PlayerController implements ShipController {
  #inputType: "keyboard" | "mouse";

  constructor() {
    this.#inputType = "mouse";
  }

  get isPlayer(): boolean {
    return true;
  }

  onInitialize(engine: Engine, ship: Ship): void {
    engine.input.pointers.on("move", (e) => {
      this.#inputType = "mouse";
      ship.rotateTo(e.worldPos, true);
    });

    engine.input.pointers.primary.on("down", () => {
      engine.currentScene.camera.shake(2, 2, 100);
      ship.fire();
    });

    ship.on("precollision", (e) => {
      if (e.other instanceof CosmicBody) {
        engine.currentScene.camera.shake(4, 4, 100);
      }
    });
  }

  onUpdate(engine: Engine, delta: number, ship: Ship): void {
    this.#applyPlayerInput(engine, delta, ship);
  }

  #applyPlayerInput(engine: Engine, delta: number, ship: Ship) {
    if (engine.input.keyboard.isHeld(Keys.W)) {
      ship.accelerate();

      const shakeMagnitude = 1 + ship.vel.squareDistance() * 0.0000015;
      engine.currentScene.camera.shake(shakeMagnitude, shakeMagnitude, 50);
    }

    let rotation = 0;
    if (engine.input.keyboard.isHeld(Keys.A)) {
      this.#inputType = "keyboard";
      rotation -= 1;
    }

    if (engine.input.keyboard.isHeld(Keys.D)) {
      this.#inputType = "keyboard";
      rotation += 1;
    }

    if (rotation !== 0) {
      ship.rotate(rotation * delta * 0.005, true);
    }
  }
}
