import { Actor, Color, EmitterType, Engine, ParticleEmitter, Scene, vec } from "excalibur";
import { Asteroid } from "../actors/asteroid";
import { Ship } from "../actors/ship";
import { PlayerController } from "../controllers/player-controller";
import { HunterAI } from "../controllers/hunter-ai";
import { Resources } from "../resources";

export class SpaceScene extends Scene {
    static key = "spacescene";

    #starsParticles: ParticleEmitter;
    #player?: Actor;

    get player() {
        return this.#player;
    }

    constructor() {
        super();

        this.#starsParticles = new ParticleEmitter({});
    }

    onInitialize(engine: Engine): void {
        engine.backgroundColor = Color.Black;

        const player = new Ship({
            pos: vec(150, 180),
            controller: new PlayerController(),
            colliderScale: 0.65,
            name: "Player",
        });

        this.add(player);
        this.#player = player;

        const hostileSpawns = [vec(50, -50), vec(150, -100), vec(250, -50)];

        hostileSpawns.forEach((pos) => {
            this.add(
                new Ship({
                    pos,
                    controller: new HunterAI(),
                    shipImage: Resources.Ship.Pirate.Default,
                })
            );
        });

        Asteroid.randomSpawn(100, this);

        this.camera.strategy.elasticToActor(player, 0.5, 0.1);
        this.camera.pos = player.pos;

        this.#starsParticles = new ParticleEmitter({
            emitterType: EmitterType.Rectangle,
            width: engine.drawWidth,
            height: engine.drawHeight,
            x: -engine.halfDrawWidth,
            y: -engine.halfDrawHeight,
            minAngle: 0,
            maxAngle: Math.PI * 2,
            emitRate: 50,
            fadeFlag: true,
            minSize: 0.8,
            maxSize: 1,
            particleLife: 5000,
            isEmitting: true,
            opacity: 0.8,
        });

        engine.currentScene.add(this.#starsParticles);
    }

    onPostUpdate(_engine: Engine, _delta: number): void {
        if (!this.#player) return;

        this.#starsParticles.transform.pos = this.#player.pos.sub(
            vec(_engine.halfDrawWidth, _engine.halfDrawHeight)
        );
    }
}
