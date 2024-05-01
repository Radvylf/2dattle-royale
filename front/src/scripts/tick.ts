import { Player, FpPlayer } from "./player";
import { Projectile } from "./projectile";
import { MapObjectTracker } from "./object";
import { Ws } from "./ws";

class OtherPlayer extends Player {

}

export class TickLoop {
    player: FpPlayer | null;
    players: Map<string, OtherPlayer>;

    projectiles: Projectile[];

    objects: MapObjectTracker;

    ws: Ws;

    constructor(ws: Ws) {
        this.player = null;
        this.players = new Map();

        this.projectiles = [];

        this.objects = new MapObjectTracker();

        this.ws = ws;
    }

    tick(tick_diff_ms: number) {
        this.player?.tick(tick_diff_ms);

        for (const proj of this.projectiles) proj.tick(tick_diff_ms);
    }

    attatch_player(player: FpPlayer) {
        this.player = player;
    }
}