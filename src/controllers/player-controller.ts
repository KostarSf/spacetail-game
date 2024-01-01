import { Engine, Keys } from "excalibur";
import { CosmicBody } from "../actors/cosmic-body";
import { Ship } from "../actors/ship";
import { ShipController } from "./ship-controller";

export class PlayerController implements ShipController {
  #inputType: "keyboard" | "mouse";

  constructor() {
    this.#inputType = "mouse";
  }

  get isPlayer(): boolean {
    return true;
  }

  get isPirate(): boolean {
    return false;
  }

  onInitialize(_engine: Engine, _ship: Ship): void {
    _engine.input.pointers.on("move", (e) => {
      this.#inputType = "mouse";
      _ship.rotateTo(e.worldPos, true);
    });

    _engine.input.pointers.primary.on("down", () => {
      _engine.currentScene.camera.shake(2, 2, 100);
      _ship.fire();
    });

    _ship.on("precollision", (e) => {
      if (e.other instanceof CosmicBody) {
        _engine.currentScene.camera.shake(4, 4, 100);
      }
    });
  }

  onTakeDamage(_ship: Ship, _amount: number, _angle: number): void {
    _ship.scene.camera.shake(5, 5, 500);
  }

  onUpdate(_engine: Engine, _delta: number, _ship: Ship): void {
    this.#applyPlayerInput(_engine, _delta, _ship);
  }

  #applyPlayerInput(engine: Engine, delta: number, ship: Ship) {
    if (engine.input.keyboard.isHeld(Keys.W)) {
      const boosted = engine.input.keyboard.isHeld(Keys.ShiftLeft);

      ship.accelerate();
      ship.boost(boosted);

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
