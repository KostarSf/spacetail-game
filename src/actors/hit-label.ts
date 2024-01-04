import { Actor, Color, Engine, Font, ImageFiltering, Text, Vector, vec } from "excalibur";
import { linInt } from "../utils";

export class HitLabel extends Actor {
    #amount: number;

    #timeToLive = 700; //ms
    #liveFor = 0;

    constructor(pos: Vector, amount: number) {
        super({
            pos: pos,
            vel: vec(0, -30),
        });

        this.#amount = amount;
    }

    onInitialize(_engine: Engine): void {
        this.graphics.use(
            new Text({
                text: "-" + this.#amount,
                color: Color.Yellow,
                font: new Font({
                    family: "monospace",
                    filtering: ImageFiltering.Pixel,
                    size: 12,
                    bold: true,
                }),
            })
        );

        this.actions.delay(this.#timeToLive).die();
    }

    onPostUpdate(_engine: Engine, _delta: number): void {
        this.graphics.opacity = linInt(this.#liveFor, 0, this.#timeToLive, 1, 0);
        this.#liveFor += _delta;
    }

    static create(parent: Actor, amount: number) {
        if (parent.isKilled() || parent.isOffScreen) return;

        amount = Math.round(amount * 10) / 10;

        const label = new HitLabel(parent.pos.add(vec(0, -5)), amount);
        parent.scene.add(label);
    }
}
