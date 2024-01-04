import { Actor, CollisionType, Color, Engine, Line, vec } from "excalibur";
import { CosmicBody } from "../actors/cosmic-body";
import { Ship } from "../actors/ship";
import { random } from "../main";
import { linInt } from "../utils";
import { TickableController } from "./tickable-controller";
import { Asteroid } from "../actors/asteroid";
import { Item } from "../actors/items/item";

export class HunterAI extends TickableController {
    #primaryTarget?: Actor | null;
    #currentTarget?: Actor | null;

    #accelerate = false;
    #boost = false;

    #nearestObstacles = new Set<Actor>();
    #nearestValuables = new Set<Actor>();

    #avadingObstaclesTrigger: Actor;
    #avadingRadius = 40;

    #midRangeTrigger: Actor;
    #midRangeRadius = 150;

    #maxHealth = 100;
    #health = this.#maxHealth;
    #healthLine: Line;

    /** For returning on this pos after purcuit finishes */
    // #lastIdlePos = vec(0, 0);

    get isPirate(): boolean {
        return true;
    }

    constructor() {
        super({ ticksInterval: 200 });

        this.#avadingObstaclesTrigger = new Actor({
            radius: this.#avadingRadius,
            collisionType: CollisionType.Passive,
        });

        this.#midRangeTrigger = new Actor({
            radius: this.#midRangeRadius,
            collisionType: CollisionType.Passive,
        });

        this.#healthLine = new Line({
            start: vec(0, -20),
            end: vec(40, -20),
            color: Color.Red,
            thickness: 3,
        });
    }

    onInitialize(_engine: Engine, _ship: Ship): void {
        super.onInitialize(_engine, _ship);

        _ship.addChild(this.#avadingObstaclesTrigger);
        _ship.addChild(this.#midRangeTrigger);

        _ship.graphics.add(this.#healthLine);

        this.#avadingObstaclesTrigger.on("collisionstart", (e) => {
            if (e.other instanceof CosmicBody && e.other !== _ship) {
                this.#nearestObstacles.add(e.other);
            }
        });

        this.#avadingObstaclesTrigger.on("collisionend", (e) => {
            if (e.other instanceof CosmicBody) {
                this.#nearestObstacles.delete(e.other);
            }
        });

        this.#midRangeTrigger.on("collisionstart", (e) => {
            const other = e.other;

            if ((other instanceof Asteroid && other.type === "Item") || other instanceof Item) {
                this.#nearestValuables.add(other);
            }
        });

        this.#midRangeTrigger.on("precollision", (e) => {
            const other = e.other;

            if (other instanceof Ship) {
                if (other.controller.isPlayer && !this.#currentTarget) {
                    this.#updateTarget(other);
                } else if (this.#primaryTarget && other.controller instanceof HunterAI) {
                    other.controller.#updateTarget(this.#primaryTarget);
                }
            }
        });

        this.#midRangeTrigger.on("collisionend", (e) => {
            if (
                (e.other instanceof Asteroid && e.other.type === "Item") ||
                e.other instanceof Item
            ) {
                this.#nearestValuables.delete(e.other);
            }
        });
    }

    onTick(_engine: Engine, _ship: Ship) {
        if (
            !(this.#currentTarget instanceof Item) &&
            (!(this.#currentTarget instanceof Ship) || this.#health < this.#maxHealth / 2)
        ) {
            for (const valuable of this.#nearestValuables) {
                if (valuable.isKilled()) {
                    this.#nearestValuables.delete(valuable);
                    continue;
                }

                if (valuable instanceof Asteroid && this.#currentTarget instanceof Asteroid) {
                    continue;
                }

                this.#currentTarget = valuable;
                break;
            }
        }

        if (!this.#currentTarget || this.#currentTarget.isKilled()) {
            if (
                !this.#primaryTarget ||
                this.#primaryTarget.isKilled() ||
                this.#currentTarget === this.#primaryTarget ||
                this.#currentTarget === _ship
            ) {
                this.#primaryTarget = null;
                this.#currentTarget = null;
            } else {
                this.#currentTarget = this.#primaryTarget;
            }
        } else if (!this.#primaryTarget) {
            this.#primaryTarget = this.#currentTarget;
        }

        if (this.#currentTarget) {
            this.#chasing(_ship, this.#currentTarget);
        } else {
            this.#idling(_ship);
        }
    }

    #idling(_ship: Ship) {
        if (_ship.speed > 30) {
            _ship.rotateSet(_ship.vel.toAngle() + Math.PI);
            this.#accelerate = true;
        } else {
            this.#accelerate = false;
        }

        this.#boost = false;
    }

    #chasing(_ship: Ship, _target: Actor) {
        const distance = _ship.pos.distance(_target.pos);

        _ship.speedMultiplier =
            distance < 500
                ? linInt(distance, 200, 500, 1, 1.1)
                : linInt(distance, 500, 800, 1.1, 1.3);

        this.#boost = distance > 300;

        if (this.#currentTarget instanceof Ship) {
            this.#accelerate = distance > 200;

            const dice = distance < 200 ? random.d20() : random.d10();
            if (distance < 300 && dice === 1) {
                _ship.fire();
            }
        } else {
            this.#accelerate = this.#currentTarget instanceof Item ? distance > 50 : distance > 100;

            if (this.#currentTarget instanceof Asteroid && distance < 300 && random.d4() === 1) {
                _ship.fire();
            }
        }

        if (distance > 100) {
            _ship.rotateTo(_target.pos.add(_target.vel.sub(_ship.vel)));
        } else {
            _ship.rotateTo(_target.pos);
        }
    }

    onPostUpdate(_engine: Engine, _delta: number, _ship: Ship): void {
        this.#updateHealthLine(_ship);

        if (this.#accelerate) {
            _ship.accelerate();
            _ship.boost(this.#boost);
        }

        this.#nearestObstacles.forEach((obstacle) => {
            const direction = _ship.pos.sub(obstacle.pos).toAngle();
            const multiplier = linInt(
                _ship.pos.distance(obstacle.pos),
                0,
                this.#avadingRadius,
                this.#currentTarget ? 0.02 : 0.005,
                0.001
            );
            _ship.addMotion(Math.max(_ship.speed, 7) * multiplier, direction, _delta);
        });
    }

    #updateHealthLine(_ship: Ship) {
        const amount = linInt(this.#health, 0, this.#maxHealth);

        this.#healthLine.rotation = -_ship.rotation;
        this.#healthLine.end.x = 40 * amount;
    }

    onTakeDamage(_ship: Ship, _amount: number, _angle: number, _source?: Actor): void {
        const rotation = random.floating(0.5, 1.5);
        _ship.rotate(random.pickOne([-rotation, rotation]), true);

        this.#health -= _amount;
        if (this.#health <= 0) {
            _ship.destroy();
            return;
        }

        if (_source && !_source.isKilled()) {
            this.#updateTarget(_source);
        }
    }

    onRepair(_ship: Ship, _amount: number): void {
        this.#health = Math.min(this.#health + _amount, this.#maxHealth);
    }

    #updateTarget(source: Actor) {
        const newTarget = !this.#currentTarget || random.d10() === 1 ? source : null;

        if (newTarget) {
            this.#currentTarget = newTarget;
        }
    }
}
