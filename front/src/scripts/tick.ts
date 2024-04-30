import { Player, FpPlayer } from "./player";
import { MapObjectTracker } from "./object";
import { Ws } from "./ws";

class OtherPlayer extends Player {

}

export class TickLoop {
    player: FpPlayer | null;
    players: Map<string, OtherPlayer>;

    objects: MapObjectTracker;

    ws: Ws;

    constructor(ws: Ws) {
        this.player = null;
        this.players = new Map();

        this.objects = new MapObjectTracker();

        this.ws = ws;
    }

    attatch_player(player: FpPlayer) {
        this.player = player;
    }
}