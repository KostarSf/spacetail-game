import { Color, Engine, Keys, Line, vec } from "excalibur";
import { CosmicBody } from "../actors/cosmic-body";
import { Ship } from "../actors/ship";
import { ShipController } from "./ship-controller";
import { clamp, linInt } from "../utils";

export class PlayerController implements ShipController {
  // #inputType: "keyboard" | "mouse";

  #maxHealth = 4;
  #health = this.#maxHealth;
  #healthLine: Line;

  #fireCost = 35;

  #maxEnergy = 100;
  #energy = this.#maxEnergy;
  #energyLine: Line;

  constructor() {
    // this.#inputType = "mouse";

    this.#healthLine = new Line({
      start: vec(0, -20),
      end: vec(40, -20),
      color: Color.Green,
      thickness: 3,
    });

    this.#energyLine = new Line({
      start: vec(0, -24),
      end: vec(40, -24),
      color: Color.Cyan,
      thickness: 3,
    });
  }

  get isPlayer(): boolean {
    return true;
  }

  get isPirate(): boolean {
    return false;
  }

  onInitialize(_engine: Engine, _ship: Ship): void {
    _engine.input.pointers.on("move", (e) => {
      // this.#inputType = "mouse";
      _ship.rotateTo(e.worldPos, true);
    });

    _engine.input.pointers.primary.on("down", () => {
      if (_ship.isKilled()) return;

      const newValue = this.#energy - this.#fireCost;

      if (newValue >= 0) {
        this.#energy = newValue;

        _engine.currentScene.camera.shake(2, 2, 100);
        _ship.fire();
      }
    });

    _ship.on("precollision", (e) => {
      if (e.other instanceof CosmicBody) {
        _engine.currentScene.camera.shake(4, 4, 100);
      }
    });

    _ship.graphics.add(this.#healthLine);
    _ship.graphics.add(this.#energyLine);
  }

  onTakeDamage(_ship: Ship, _amount: number, _angle: number): void {
    _ship.scene.camera.shake(5, 5, 500);

    this.#energy -= this.#maxEnergy;
    this.#health -= 1;

    if (this.#health <= 0) {
      _ship.destroy();
    }
  }

  onPreUpdate(_engine: Engine, _delta: number, _ship: Ship): void {}

  onPostUpdate(_engine: Engine, _delta: number, _ship: Ship): void {
    this.#updateHealthLine(_ship);
    this.#updateEnergyLine(_ship, _delta);

    this.#applyPlayerInput(_engine, _delta, _ship);
  }

  #updateHealthLine(_ship: Ship) {
    const amount = linInt(this.#health, 0, this.#maxHealth);

    this.#healthLine.rotation = -_ship.rotation;
    this.#healthLine.end.x = 40 * amount;
  }

  #updateEnergyLine(_ship: Ship, _delta: number) {
    const lowEnergy = this.#energy < this.#fireCost;
    this.#energyLine.color = lowEnergy ? Color.Red : Color.Cyan;

    const speed = lowEnergy ? 5 : 15;
    this.#energy = clamp(this.#energy + speed / _delta, 0, this.#maxEnergy);

    this.#energyLine.rotation = -_ship.rotation;
    this.#energyLine.end.x = 40 * linInt(this.#energy, 0, this.#maxEnergy);
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
      // this.#inputType = "keyboard";
      rotation -= 1;
    }

    if (engine.input.keyboard.isHeld(Keys.D)) {
      // this.#inputType = "keyboard";
      rotation += 1;
    }

    if (rotation !== 0) {
      ship.rotate(rotation * delta * 0.005, true);
    }
  }
}
